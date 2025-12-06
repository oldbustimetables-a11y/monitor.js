const fs = require('fs');
console.log('No change for', url);
}


hashes[url] = newHash;
} catch (err) {
console.error('Error checking', url, err.message || err);
}
}


await browser.close();


// Save hashes.json
fs.writeFileSync(hashesPath, JSON.stringify(hashes, null, 2), 'utf8');
console.log('\nHashes updated.');


// If changes, create a GitHub issue and commit the updated hashes.json back to the repo
if (changes.length > 0) {
console.log('Found changes for', changes.length, 'URLs');


// Create a GitHub issue summarizing changes
if (GITHUB_TOKEN && REPO) {
const issueTitle = `Website Monitor: ${changes.length} change(s) detected`;
const bodyLines = changes.map(c => `- ${c.url}`);
const issueBody = `The monitor detected changes for the following URLs:\n\n${bodyLines.join('\n')}`;


const apiUrl = `https://api.github.com/repos/${REPO}/issues`;
try {
const resp = await fetch(apiUrl, {
method: 'POST',
headers: {
Authorization: `token ${GITHUB_TOKEN}`,
'Content-Type': 'application/json',
'User-Agent': 'github-actions-puppeteer-monitor'
},
body: JSON.stringify({ title: issueTitle, body: issueBody })
});
if (!resp.ok) {
console.warn('Failed to create GitHub issue:', resp.status);
} else {
console.log('GitHub issue created.');
}
} catch (e) {
console.warn('Error creating issue:', e.message || e);
}


// Commit updated hashes.json back to the repo
try {
// configure git
const execSync = require('child_process').execSync;
execSync('git config user.name "github-actions[bot]"');
execSync('git config user.email "github-actions[bot]@users.noreply.github.com"');
execSync('git add hashes.json');
execSync('git commit -m "Update hashes.json: detected changes"');
// push using token
const remote = `https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO}.git`;
execSync(`git push ${remote} HEAD:refs/heads/${process.env.GITHUB_REF_NAME || process.env.GITHUB_REF.replace('refs/heads/', '')}`);
console.log('Committed updated hashes.json back to repository.');
} catch (e) {
console.warn('Could not commit hashes.json back to repo:', e.message || e);
}
} else {
console.log('GITHUB_TOKEN or REPO not set; skipping issue creation / commit.');
}
} else {
console.log('No changes detected.');
}
}


run().catch(err => {
console.error('Fatal error:', err.message || err);
process.exit(1);
});
