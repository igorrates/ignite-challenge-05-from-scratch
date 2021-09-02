import { GetStaticProps } from 'next';
import Head from 'next/head';
import React, { useState } from 'react';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { useEffect } from 'react';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(props: HomeProps) {

  const [posts, setPosts] = useState(props.postsPagination);

  const loadMoreBtn = posts.next_page ?
    <a href="#" onClick={handleNextPage} className={styles.morePosts}>
      Carregar mais posts
    </a>

    : '';

  function handleNextPage() {

     fetch(posts.next_page).then((response) => {
      return response.json()
    }).then(data => {

      setPosts({
        next_page: data.next_page,
        results: [...posts.results, ...data.results]
      });
    });

  }

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {posts?.results?.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div>
                  <time><FiCalendar /> {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    })}</time>
                  <span><FiUser /> {post.data.author}</span>
                </div>
              </a>
            </Link>
          ))}
        </div>

        {loadMoreBtn}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 10,
      page: 1,
      orderings: '[document.first_publication_date]'
    },
  );

  return {
    props: {
      postsPagination: postsResponse
    },
    redirect: 60 * 30
  }
};
