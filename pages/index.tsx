import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Head from 'next/head'
import { Test } from '../components/Test';
import styles from '../styles/Home.module.css'

const queryClient = new QueryClient();

export default function Home() {

  return (  
    <div className={styles.container}>
      <Head>
        <title>Packshot generator</title>
        <meta name="description" content="Generated packshots" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <Test />
      </QueryClientProvider>
     </div>
  )
}
