export interface IGitHubFile {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string | null;
    type: 'file' | 'dir';
}

export interface IFetchResult {
    success: boolean;
    message: string;
    details: {
        suggestion: string;
        status: number;
    };
}

export const fetchGitHubBanner = async (gitHubUsername: string, repositoryName: string): Promise<IGitHubFile[] | IFetchResult | Error> => {
    try {
        const response = await fetch(`https://api.github.com/repos/${gitHubUsername}/${repositoryName}/contents/public`);

        if (!response.ok) {
            if (response.status === 404) {
                const notFoundFolder: IFetchResult = {
                    success: false,
                    message: `⚠️📂 In the repository >${repositoryName}< the "public" folder was not found.`,
                    details: {
                        suggestion: 'Create a "public" folder and insert your banner (e.g: /public/bannerXYZ.svg - bannerABC.png - bannerEFG.jpg)',
                        status: 404,
                    },
                };

                console.warn(`${notFoundFolder.message}  ℹ️${notFoundFolder.details.suggestion}`);
                return notFoundFolder;
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const jsonData = (await response.json()) as IGitHubFile[];

        const validExtensions = ['.png', '.jpg', '.jpeg', '.svg'];
        const hasBanner = jsonData.some(
            (item) =>
                item.type === 'file' &&
                item.name.toLowerCase().includes('banner') &&
                validExtensions.some((ext) => item.name.toLowerCase().endsWith(ext))
        );

        if (!hasBanner) {
            const noBannerFound: IFetchResult = {
                success: false,
                message: `⚠️🖼️ In repository >${repositoryName}< no banner file was found in folder "public".`,
                details: {
                    suggestion: 'Insert an image that contains the name "banner" and is png, jpg, jpeg or svg',
                    status: 200,
                },
            };
            console.warn(`${noBannerFound.message}  ℹ️${noBannerFound.details.suggestion}`);
            return noBannerFound;
        }

        return jsonData;
    } catch (err) {
        return err as Error;
    }
};
