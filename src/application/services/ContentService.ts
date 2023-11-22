import { ContentDTO } from "../dtos/ContentDTO";
import { Content } from "../entities/Content";
import { ContentRepository } from "../repositories/ContentRepository";
import { checkIfUrlIsGoogleNews } from "./ContentFetcherService/ContentFetcherUtils";
import { ContentRequest } from "./ContentFetcherService/model/ContentRequest";
import { ContentLinkConfigurationService } from "./ContentLinkConfigurationService";
import { NewsAggregatorDatabase } from "./NewsAggregatorDatabase";
import { ScraperItemService } from "./ScraperItemService.js";

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

    async insertAfterRetryAndSuccess(dto: ContentDTO) {
        const alreadyExistingEntity = await this.contentRepository.getEntityByBaseUrl(dto.baseUrl);

        if (alreadyExistingEntity) {
            const updatedEntity = Content.createFromDTO(dto, alreadyExistingEntity.id);
            await this.contentRepository.insert(updatedEntity);
        }
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
        contentLinkConfigurationService: ContentLinkConfigurationService,
        scarperItemService: ScraperItemService
    ): Promise<ContentRequest[]> {
        const retryList = await this.contentRepository.getAllForRetry()
        const result: ContentRequest[] = []
        for (const entity of retryList) {
            const entityUpdatedWithStatusRetry = entity.createUpdatedMarkStatusRetry()
            await this.contentRepository.insert(entityUpdatedWithStatusRetry)
            let tweet = undefined
            if (entity.relatedTweetId !== -1) {
                tweet = await newsAggregatorDatabase.tweetBy(entity.relatedTweetId)
            }
            let news = undefined
            if (entity.relatedNewsId !== -1) {
                news = await newsAggregatorDatabase.newsBy(entity.relatedNewsId)
            }
            let scarperItem = undefined
            if (entity.relatedScraperItemId !== -1) {
                scarperItem = await scarperItemService.getById(entity.relatedScraperItemId)
            }
            const contentLinkConfiguration = await contentLinkConfigurationService.getBy(entity.id_configuration)
            if (contentLinkConfiguration && ((news === undefined) || (tweet === undefined) || (scarperItem === undefined))) {
                const isGoogleNews = checkIfUrlIsGoogleNews(entity.baseUrl)
                const contentRequest = new ContentRequest(news, tweet, scarperItem, contentLinkConfiguration, isGoogleNews, [entity.baseUrl], true)
                result.push(contentRequest)
            } else {
                console.error("ContentLinkConfiguration is null or news and tweet has value. At this point Content can be connected only to one, tweet or news. Can not be attached to both. Entity id " + entity.id)
            }
        }
        return result
    }

    async getAll(): Promise<Content[]> {
        return await this.contentRepository.getAll();
    }

    async getTheNewsestEntity(): Promise<Content | undefined> {
        return await this.contentRepository.getTheNewestEntity();
    }
}