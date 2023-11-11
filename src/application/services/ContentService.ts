import { ContentDTO } from "../dtos/ContentDTO";
import { Content } from "../entities/Content";
import { ContentRepository } from "../repositories/ContentRepository";
import { checkIfUrlIsGoogleNews } from "./ContentFetcherService/ContentFetcherUtils";
import { ContentRequest } from "./ContentFetcherService/model/ContentRequest";
import { ContentLinkConfigurationService } from "./ContentLinkConfigurationService";
import { NewsAggregatorDatabase } from "./NewsAggregatorDatabase";

export class ContentService {
    private contentRepository: ContentRepository;

    constructor(repository: ContentRepository) {
        this.contentRepository = repository;
    }

    async insert(dto: ContentDTO) {
        if (dto.baseUrl) {
            const hasAlreadyContentWithTheSameDTO = await this.contentRepository.checkIfEntityWithBaseUrlExists(dto.baseUrl);
            if (hasAlreadyContentWithTheSameDTO) {
                console.log('Content with same URL already exists' + dto.baseUrl);
                return
            }
        }

        const theNewestEntity = (await this.contentRepository.getTheNewestEntity())
        let newId
        if (theNewestEntity) {
            newId = theNewestEntity.id + 1;
        } else {
            newId = 0;
        }
        const entity = Content.createFromDTO(dto, newId);
        await this.contentRepository.insert(entity);
        return entity;
    }

    async insertForRetry(dto: ContentDTO): Promise<boolean> {
        const alreadyExistingContentEntity = await this.contentRepository.getEntityByBaseUrl(dto.baseUrl);
        let newError: string = ""
        if (dto.errors.length > 0) {
            newError = dto.errors[0]
        }
        if (alreadyExistingContentEntity) {
            const updateEntity = alreadyExistingContentEntity.createUpdatedWithUpdatedRetryAndMarkAsError(newError)
            this.contentRepository.insert(updateEntity)
            return true
        } else {
            return false
        }
    }

    async checkIfContentAlreadyExistsFor(url: string): Promise<boolean> {
        return await this.contentRepository.checkIfEntityWithBaseUrlExists(url);
    }

    async createListOfContentRequestOfContentWithError(
        newsAggregatorDatabase: NewsAggregatorDatabase,
        contentLinkConfigurationService: ContentLinkConfigurationService
    ): Promise<ContentRequest[]> {
        const retryList = await this.contentRepository.getAllForRetry()
        const result: ContentRequest[] = []
        for (const entity of retryList) {
            const entityUpdatedWithStatusRetry = entity.createUpdatedMarkStatusRetry()
            await this.contentRepository.insert(entityUpdatedWithStatusRetry)
            const tweet = undefined
            const news = undefined
            const contentLinkConfiguration = undefined
            const isGoogleNews = checkIfUrlIsGoogleNews(entity.baseUrl)
            const contentRequest = new ContentRequest(news, tweet, contentLinkConfiguration, isGoogleNews, [entity.baseUrl], true)
            result.push(contentRequest)
        }
        return result
    }

    async getAll(): Promise<Content[]> {
        return await this.contentRepository.getAll();
    }
}