import { GetStaticProps } from 'next'
import Head from 'next/head'
import Prismic from '@prismicio/client'
import { FiCalendar, FiUser } from 'react-icons/fi'

import Link from 'next/link'
import { useState } from 'react'
import { getPrismicClient } from '../services/prismic'

import commonStyles from '../styles/common.module.scss'
import styles from './home.module.scss'
import { formatDate } from '../utils/formatDate'
import Header from '../components/Header'

interface Post {
  uid?: string
  first_publication_date: string | null
  data: {
    title: string
    subtitle: string
    author: string
  }
}

interface PostPagination {
  next_page: string
  results: Post[]
}

interface HomeProps {
  postsPagination: PostPagination
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  // TODO
  const [posts, setPosts] = useState(postsPagination.results)
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(
    postsPagination.next_page
  )

  function getMorePosts(): void {
    if (nextPageUrl) {
      fetch(`${nextPageUrl}`)
        .then(response => response.json())
        .then(data => {
          setNextPageUrl(data.next_page)

          const postData = data.results.map(post => {
            return {
              uid: post.uid,
              first_publication_date: formatDate(post.first_publication_date),
              data: {
                title: post.data.title,
                subtitle: post.data.subtitle,
                author: post.data.author,
              },
            }
          })

          setPosts([...posts, ...postData])
        })
    }
  }

  return (
    <>
      <Head>
        <title>Space Travelling - Stories</title>
      </Head>
      <Header />
      <main className={commonStyles.appContainer}>
        {posts.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a className={styles.postItem}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>

              <div className={commonStyles.postItemInfo}>
                <div>
                  <FiCalendar size={20} />
                  <span>{formatDate(post.first_publication_date)}</span>
                </div>
                <div>
                  <FiUser size={20} /> <span>{post.data.author}</span>
                </div>
              </div>
            </a>
          </Link>
        ))}
        {nextPageUrl && (
          <button
            type="button"
            className={styles.moreButton}
            onClick={getMorePosts}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient()
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 5,
    }
  )

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    }
  })

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results,
      },
    },
    revalidate: 60 * 60, // 1 hour
  }
}
