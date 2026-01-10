// api/update-map.js
export default async function handler(req, res) {
  // Hanya terima POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    
    // GitHub API configuration
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Set di Vercel Environment Variables
    const GITHUB_OWNER = 'Bejirrr';
    const GITHUB_REPO = 'datamap';
    const FILE_PATH = 'list-map.json';
    const BRANCH = 'main';

    // Get file SHA (diperlukan untuk update)
    const getFileResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    const fileData = await getFileResponse.json();
    const sha = fileData.sha;

    // Convert data to base64
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

    // Update file di GitHub
    const updateResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Update map list via Vercel',
          content: content,
          sha: sha,
          branch: BRANCH
        })
      }
    );

    if (updateResponse.ok) {
      return res.status(200).json({ 
        success: true, 
        message: 'File berhasil diupdate di GitHub' 
      });
    } else {
      const errorData = await updateResponse.json();
      throw new Error(errorData.message || 'Gagal update file');
    }

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Gagal menyimpan data', 
      details: error.message 
    });
  }
}
