import { ContentDTO } from "../dtos/ContentDTO";
import { Content } from "../entities/Content";
import { ContentRepository } from "../repositories/ContentRepository";

export class ContentService {
    private contentRepository: ContentRepository;

    constructor(repository: ContentRepository) {
        this.contentRepository = repository;
    }

    async insert(dto: ContentDTO) {
        const hasAlreadyContentWithTheSameDTO = await this.contentRepository.checkIfEntityWithUrlExists(dto.url);
        if (hasAlreadyContentWithTheSameDTO) {
            throw new Error('Content with same URL already exists');
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

    async getAll(): Promise<Content[]> {
        return await this.contentRepository.getAll();
    }
}