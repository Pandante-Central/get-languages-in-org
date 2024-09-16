import { Octokit } from "octokit";
import "dotenv/config";


const ORG_NAME = "octodemo";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    org: ORG_NAME,
});

let outputData = {
    numberOfRepos: 0,
    numberOfCodeQLCompatibleRepos: 0,
    listOfCodeQLCompatibleRepos: [],
};

const codeQLLanguages = ["C++", "C", "C#", "Go", "Java", "JavaScript", "Python", "TypeScript", "Vue"];

const iterator = octokit.paginate.iterator("GET /orgs/{org}/repos", {
    org: ORG_NAME,
    headers: {
        "X-GitHub-Api-Version": "2022-11-28"
    },
});

let listOfRepos = [];
for await (const { data } of iterator) {
    for (const repo of data) {
        listOfRepos = [...listOfRepos, {
            id: repo.id,
            name: repo.name,
            languages: await octokit.request("GET /repos/{org}/{repo}/languages", {
                org: ORG_NAME,
                repo: repo.name,
                headers: {
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            }).then(response => response.data)
        }];
    }
}

outputData.numberOfRepos = listOfRepos.length;


for (const repo of listOfRepos) {
    for (const language of Object.keys(repo.languages)) {
        if (codeQLLanguages.includes(language)) {
            outputData.numberOfCodeQLCompatibleRepos += 1;
            outputData.listOfCodeQLCompatibleRepos.push(repo.name);
            break;
        }
    }
};

console.log(`Organization: ${ORG_NAME}`);
console.log(`Number of Repos: ${outputData.numberOfRepos}`);
console.log(`Number of CodeQL Compatible Repos: ${outputData.numberOfCodeQLCompatibleRepos}`);
console.log(`List of CodeQL Compatible Repos: ${outputData.listOfRepos}`);
