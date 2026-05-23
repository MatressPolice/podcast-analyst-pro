import fs from 'fs';

let envStr = '';
try {
  envStr = fs.readFileSync('.env.local', 'utf-8');
} catch {
  envStr = fs.readFileSync('.env', 'utf-8');
}

const env = Object.fromEntries(
  envStr
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=');
      if (idx === -1) return [line, ''];
      const key = line.substring(0, idx).trim();
      let val = line.substring(idx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      return [key, val];
    })
);

const query = `
query {
  __type(name: "PodcastEpisode") {
    fields {
      name
      description
      type {
        name
        kind
        ofType {
          name
        }
      }
    }
  }
}
`;

fetch('https://api.taddy.org', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-USER-ID': env.VITE_TADDY_USER_ID,
    'X-API-KEY': env.VITE_TADDY_API_KEY
  },
  body: JSON.stringify({ query })
})
.then(res => res.json())
.then(data => {
  if (data.data && data.data.__type && data.data.__type.fields) {
    console.log(JSON.stringify(data.data.__type.fields, null, 2));
  } else {
    console.log("Unexpected response:", data);
  }
})
.catch(console.error);
