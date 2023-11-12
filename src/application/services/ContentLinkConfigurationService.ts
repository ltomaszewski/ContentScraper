import { ContentLinkConfigurationDTO } from "../dtos/ContentLinkConfigurationDTO";
import { ContentLinkConfiguration } from "../entities/ContentLinkConfiguration";
import { ContentLinkConfigurationRepository } from "../repositories/ContentLinkConfigurationRepository";

export class ContentLinkConfigurationService {
    private contentLinkConfigurationRepository: ContentLinkConfigurationRepository;

    constructor(repository: ContentLinkConfigurationRepository) {
        this.contentLinkConfigurationRepository = repository;
    }

    async insert(dto: ContentLinkConfigurationDTO) {
        const configurations = await this.contentLinkConfigurationRepository.getAll();
        if ((await configurations).find(x => this.areStringArraysIdentical(x.urlPrefixs, dto.urlPrefixs))) {
            throw Error(`Content Link Configuration already exists with linkPrefix ${dto.urlPrefixs}`);
        }
        const newId = ContentLinkConfiguration.createNewId(configurations);
        const entity = ContentLinkConfiguration.createFromDTO(dto, newId);
        await this.contentLinkConfigurationRepository.insert(entity);
        return entity;
    }

    async insertWithForce(dto: ContentLinkConfigurationDTO) {
        if (dto.id) {
            const entity = ContentLinkConfiguration.createFromDTO(dto, dto.id);
            await this.contentLinkConfigurationRepository.insert(entity);
            return entity;
        } else {
            throw Error("Id is required");
        }
    }

    async delete(id: number) {
        const contentLinkConfigurations = await this.contentLinkConfigurationRepository.getAll()
        const contentLinkConfiguration = await contentLinkConfigurations.find(x => x.id === id)
        if (contentLinkConfiguration) {
            await this.contentLinkConfigurationRepository.delete(contentLinkConfiguration)
            return contentLinkConfiguration
        } else {
            throw Error("ContentLinkConfiration not found");
        }
    }

    async getBy(id: number): Promise<ContentLinkConfiguration | undefined> {
        return await this.contentLinkConfigurationRepository.getById(id)
    }

    async getAll(): Promise<ContentLinkConfiguration[]> {
        return await this.contentLinkConfigurationRepository.getAll();
    }

    private areStringArraysIdentical(arr1: string[], arr2: string[]): boolean {
        // Check if arrays have the same length
        if (arr1.length !== arr2.length) {
            return false;
        }

        // Check if individual elements are identical
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }

        // Arrays are identical
        return true;
    }
}