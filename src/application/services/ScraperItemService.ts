import { ScraperItemDTO } from "../dtos/ScraperItemDTO.js";
import { ScraperItem } from "../entities/ScraperItem";
import { ScraperItemRepository } from "../repositories/ScraperItemRepository";

export class ScraperItemService {
    private repository: ScraperItemRepository;

    constructor(repository: ScraperItemRepository) {
        this.repository = repository;
    }

    async insert(scraperItemDTO: ScraperItemDTO): Promise<void> {
        const exists = await this.repository.getByUrl(scraperItemDTO.url);
        if (exists) {
            throw new Error("An item with the same URL already exists.");
        }

        const theNewestEntity = (await this.repository.getTheNewestEntity())
        let newId
        if (theNewestEntity) {
            newId = theNewestEntity.id + 1;
        } else {
            newId = 0;
        }

        const entity = ScraperItem.createFromDTO(scraperItemDTO, newId)
        await this.repository.insert(entity);
    }
}