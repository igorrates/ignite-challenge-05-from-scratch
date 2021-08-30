import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { string } from 'yargs';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
      alt: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post(props: PostProps) {


  const router = useRouter()
  const [readingTime, setReadingTime] = useState(calculateReadingTime);
  function calculateReadingTime() {
    return '4 min'
  }

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  return (
    <>
      <Head>
        <title>spacenews | {props.post?.data?.title}</title>
      </Head>
      <section className={styles.banner}>
        <img src={props.post?.data?.banner?.url} alt={props.post?.data?.banner?.alt} />
      </section>

      <article className={`${commonStyles.container} ${styles.post}`}>
        <h1>{props.post?.data?.title}</h1>
        <section>
          <time><FiCalendar /> {props.post?.first_publication_date ? format(
            new Date(props.post?.first_publication_date),
            'dd MMM yyyy',
            {
              locale: ptBR,
            }) : ""}</time>
          <span><FiUser /> {props.post?.data?.author}</span>
          <span><FiClock /> {readingTime} </span>
        </section>

        {props.post?.data?.content.map(content => (
          <main key={content.heading}>
            <strong>{content.heading}</strong>
            <div className={styles.postContent}
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(content.body)
              }} />
          </main>
        ))}


      </article>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 30,
      orderings: '[document.first_publication_date]'
    },
  );

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      }
    }
  });

  return {
    paths: paths, fallback: true
  }
};

export const getStaticProps: GetStaticProps = async context => {

  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  return {
    props: {
      post: response
    },
    redirect: 60 * 30 // 30 mins
  }
};
