import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi'
import Prismic from '@prismicio/client'

import { useRouter } from 'next/router'
import { RichText } from 'prismic-dom'
import { getPrismicClient } from '../../services/prismic'

import commonStyles from '../../styles/common.module.scss'
import styles from './post.module.scss'
import { formatDate } from '../../utils/formatDate'
import { getReadingTime } from '../../utils/getReadingTime'
import Header from '../../components/Header'

interface Post {
  first_publication_date: string | null
  data: {
    title: string
    banner: {
      url: string
    }
    author: string
    content: {
      heading: string
      body: {
        text: string
      }[]
    }[]
  }
}

interface PostProps {
  post: Post
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter()
  const readingTime = post ? getReadingTime(post?.data.content) : ''

  // const postContent = post?.data.content.map(content => {
  //   return {
  //     heading: content.heading,
  //     body: RichText.asHtml(content.body),
  //   }
  // })

  if (router.isFallback) {
    return <div>Carregando...</div>
  }
  // TODO

  return (
    <>
      <Head>
        <title>{post.data.title} | SpaceTravelling</title>
      </Head>
      <Header />
      <img
        className={styles.postCover}
        src={post.data.banner.url}
        alt={post.data.title}
      />
      <main className={commonStyles.appContainer}>
        <section className={styles.postContainer}>
          <h1>{post.data.title}</h1>
          <div className={commonStyles.postItemInfo}>
            <div>
              <FiCalendar size={20} />
              <span>{formatDate(post.first_publication_date)}</span>
            </div>
            <div>
              <FiUser size={20} /> <span>{post.data.author}</span>
            </div>
            <div>
              <FiClock size={20} /> <span>{readingTime} min</span>
            </div>
          </div>
          <div className={styles.postContent}>
            {post?.data.content.map(content => (
              <div key={content.heading}>
                <h3>{content.heading}</h3>
                {/* eslint-disable react/no-danger */}
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient()
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    { pageSize: 3 }
  )

  const paths = posts.results.map(result => {
    return {
      params: {
        slug: result.uid,
      },
    }
  })
  return {
    paths,
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient()
  const slug = String(params.slug)
  const postResponse = await prismic.getByUID('posts', String(slug), {})

  const post = {
    uid: postResponse.uid,
    first_publication_date: postResponse.first_publication_date,
    data: {
      title: postResponse.data.title,
      subtitle: postResponse.data.subtitle,
      author: postResponse.data.author,
      banner: postResponse.data.banner,
      content: postResponse.data.content,
    },
  }

  return {
    props: {
      post,
    },
    // revalidate: 60 * 60 * 24, // 24 hours
  }
}
