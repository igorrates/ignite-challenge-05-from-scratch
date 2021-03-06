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
import Comments from '../../components/Comments'
import Link from 'next/link'
import ExitPreviewButton from '../../components/ExitPreviewButton';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  uid: string;
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
  preview: boolean;
  post: Post;
  prevPost?: Post | null;
  nextPost?: Post | null;
}

export default function Post(props: PostProps) {


  const router = useRouter()
  const [readingTime] = useState(calculateReadingTime);
  function calculateReadingTime() {

    /** Regex to count workds
     * value.match(/\S+/g).length
    */

    const postContent = props?.post?.data?.content;

    var words = postContent.reduce((count, content) => {
      count += content.heading.match(/\S+/g).length;
      count += RichText.asText(content.body).match(/\S+/g).length;
      return count;
    }, 0)

    const mins = Math.ceil(words / 200)
    return `${mins} ${mins > 1 ? 'mins' : 'min'}`
  }

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  console.log(props)

  return (
    <>
      <Head>
        <title>spacenews | {props.post?.data?.title}</title>
      </Head>
      <section className={styles.banner}>
        <img src={props.post?.data?.banner?.url} alt={props.post?.data?.banner?.alt} />
      </section>

      {props.preview && (
        <ExitPreviewButton />
      )}

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
          {props.post?.last_publication_date && (
            <>
              <br />
              <time> *editado em {format(
                new Date(props.post?.last_publication_date),
                'dd MMM yyyy, H:mm',
                {
                  locale: ptBR,
                })}</time>
            </>
          )}
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
      <div className={styles.footerContent}>
        <footer>
          <aside>
            {props.prevPost && (
              <span className={styles.navPrevious}>{props.prevPost.data?.title}</span>
            )}
            {props.nextPost && (
              <span className={styles.navNext}>{props.nextPost.data?.title}</span>
            )}
          </aside>
          <aside>
            {props.prevPost && (
              <Link  href={`/post/${props.prevPost.uid}`}>
                <a className={styles.navPrevious}>Post Anterior</a>
              </Link>
            )}
            {props.nextPost && (
              <Link href={`/post/${props.nextPost?.uid}`}>
                <a className={styles.navNext}>Pr??ximo Post</a>
              </Link>
            )}
          </aside>

          <Comments />
        </footer>
      </div>
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
      orderings: '[document.first_publication_date]',
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

export const getStaticProps: GetStaticProps = async ({ params, preview = false, previewData }) => {

  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {
    ref: previewData?.ref ?? null
  });

  const prevPost = (await prismic.query(
    Prismic.predicates.at('document.type', 'post'),
    {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date desc]',
      fetch: ['post.title'],
    }))?.results[0];

  const nextPost = (await prismic.query(
    Prismic.predicates.at('document.type', 'post'),
    {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date]',
      fetch: ['post.title'],
    }))?.results[0];



  return {
    props: {
      preview,
      post: response,
      prevPost: prevPost == undefined ? null : prevPost,
      nextPost: nextPost == undefined ? null : nextPost,
    },
    redirect: 60 * 30 // 30 mins
  }
};
