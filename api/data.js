// ===== api/data.js =====
import { Octokit } from 'octokit';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER || 'your-username';
const REPO_NAME = process.env.REPO_NAME || 'your-repo-name';
const FILE_PATH = 'data/data.json';
const BRANCH = 'main';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function getDataFile() {
  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: FILE_PATH,
      ref: BRANCH,
    });
    return {
      content: Buffer.from(response.data.content, 'base64').toString('utf8'),
      sha: response.data.sha
    };
  } catch (error) {
    if (error.status === 404) {
      return {
        content: JSON.stringify({ gallery: [], lastUpdated: new Date().toISOString() }),
        sha: null
      };
    }
    throw error;
  }
}

async function updateDataFile(content, sha) {
  await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
    owner: REPO_OWNER,
    repo: REPO_NAME,
    path: FILE_PATH,
    message: 'Update gallery from website',
    content: Buffer.from(content).toString('base64'),
    sha: sha,
    branch: BRANCH,
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET - return gallery data
  if (req.method === 'GET') {
    try {
      const { content } = await getDataFile();
      res.status(200).json(JSON.parse(content));
    } catch (error) {
      res.status(500).json({ error: 'Failed to read data', details: error.message });
    }
    return;
  }

  // POST - update gallery
  if (req.method === 'POST') {
    try {
      const newData = req.body;
      if (!newData) {
        res.status(400).json({ error: 'No data provided' });
        return;
      }

      const { content, sha } = await getDataFile();
      let currentData;
      try {
        currentData = JSON.parse(content);
      } catch (e) {
        currentData = { gallery: [], lastUpdated: new Date().toISOString() };
      }

      const mergedData = {
        gallery: newData.gallery || currentData.gallery || [],
        lastUpdated: new Date().toISOString()
      };

      await updateDataFile(JSON.stringify(mergedData, null, 2), sha);
      res.status(200).json({ success: true, data: mergedData });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update data', details: error.message });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}