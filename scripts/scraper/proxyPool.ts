const proxies: (string | null)[] = [
  null,
  // 'http://username:password@proxy1.example.com:8080'
]

export async function getRandomProxy(): Promise<string | null> {
  const index = Math.floor(Math.random() * proxies.length)
  return proxies[index]
}
