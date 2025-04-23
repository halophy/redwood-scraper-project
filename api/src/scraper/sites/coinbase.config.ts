const config = {
  name: 'coinbase',
  blogUrl: 'https://www.coinbase.com/en-sg/blog',
  indexPage: '/landing',
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
  articleLinkSelector: `
    (() => {
      const anchors = Array.from(document.querySelectorAll('a[data-qa^="Wayfinding-Child"]'));
      return anchors
        .map(a => a.href)
        .filter(href => href.includes('/en-sg/blog/'));
    })()
  `,
}

export default config
