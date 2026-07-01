document.getElementById('gaslight').addEventListener('click', async () => {
  const status = document.getElementById('status');
  status.textContent = 'Scraping listing...';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url.includes('facebook.com/marketplace')) {
    status.textContent = 'Error: Open a Marketplace item page first!';
    return;
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: scrapeCurrentListing
  });

  const data = results[0].result;
  const prompt = buildAssholePrompt(data);

  const encoded = encodeURIComponent(prompt);
  chrome.tabs.create({ url: `https://chatgpt.com/?q=${encoded}` });

  document.getElementById('output').value = prompt;
  status.textContent = '✅ ChatGPT opened with prompt. Copy response & paste in FB chat!';
});

function scrapeCurrentListing() {
  return {
    title: document.querySelector('h1')?.innerText || 'Item',
    price: document.querySelector('[aria-label*="price"], [class*="price"], .x1lliihq')?.innerText || 'Unknown',
    description: Array.from(document.querySelectorAll('div, span, p')).find(el => 
      el.innerText && el.innerText.length > 100 && el.innerText.length < 2000
    )?.innerText || 'No description',
    condition: 'Used / As described',
    url: window.location.href
  };
}

function buildAssholePrompt(data) {
  return `You are Chad, the ultimate ruthless lowballing asshole on Facebook Marketplace. 
Psychologically destroy the seller. Roast the item, photos, description, price, their life. 
Offer 30-60% less or worse. Be savage, sarcastic, confident, no mercy.

Item:
Title: ${data.title}
Price: ${data.price}
Description: ${data.description}
Condition: ${data.condition}

Write ONE extremely aggressive opening message + lowball offer. Make it hurt.`;
}

document.getElementById('copy').addEventListener('click', () => {
  navigator.clipboard.writeText(document.getElementById('output').value);
  alert('✅ Copied! Paste GPT response into the Marketplace chat.');
});