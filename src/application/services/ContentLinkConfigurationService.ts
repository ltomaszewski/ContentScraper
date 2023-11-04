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
        if ((await configurations).find(x => x.linkPrefix === dto.linkPrefix)) {
            throw Error(`Content Link Configuration already exists with linkPrefix ${dto.linkPrefix}`);
        }
        const newId = ContentLinkConfiguration.createNewId(configurations);
        const entity = ContentLinkConfiguration.createFromDTO(dto, newId);
        await this.contentLinkConfigurationRepository.insert(entity);
        return entity;
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

    async getAll(): Promise<ContentLinkConfiguration[]> {
        return await this.contentLinkConfigurationRepository.getAll();
    }
}