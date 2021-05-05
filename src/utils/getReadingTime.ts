import { RichText } from 'prismic-dom'

type Content = {
  heading: string
  body: {
    text: string
  }[]
}

export function getReadingTime(postContent: Content[]): number {
  const wordsPerMinute = 200

  return postContent.reduce((acc, content) => {
    const wordsInHeading = content.heading.split(' ').length
    const wordsInBody = RichText.asText(content.body).split(' ').length

    const wordsInPost = wordsInHeading + wordsInBody + acc
    const readingTime = Math.ceil(wordsInPost / wordsPerMinute)

    return readingTime + 1
  }, 0)
}
