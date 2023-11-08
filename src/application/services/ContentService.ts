import { ContentDTO } from "../dtos/ContentDTO";
import { Content } from "../entities/Content";
import { ContentRepository } from "../repositories/ContentRepository";

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

    async checkIfContentAlreadyExistsFor(url: string): Promise<boolean> {
        return await this.contentRepository.checkIfEntityWithBaseUrlExists(url);
    }

    async getAll(): Promise<Content[]> {
        return await this.contentRepository.getAll();
    }
}