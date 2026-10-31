import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

interface AudiencePath {
  title: string;
  description: string;
  to: string;
}

const AUDIENCE_PATHS: AudiencePath[] = [
  {
    title: 'Executives',
    description: 'What DryvHub is, how it earns and protects value, what is live today, and the risks to watch.',
    to: '/docs/executive/overview',
  },
  {
    title: 'Dealer app',
    description: 'Every screen dealers use: inventory, listings, inquiries, cashback, financials, reports.',
    to: '/docs/dealer/overview',
  },
  {
    title: 'Marketplace',
    description: 'The public buyer site: browsing, inquiries, Messenger hand-off, and cashback claims.',
    to: '/docs/marketplace/overview',
  },
  {
    title: 'Developers',
    description: 'Architecture, local setup, authentication, data model, testing, and contribution workflow.',
    to: '/docs/developers/architecture',
  },
];

export default function Home(): ReactNode {
  return (
    <Layout
      title="DryvHub Guide"
      description="Internal documentation for DryvHub Dealer and DryvHub Marketplace — for executives, teams, and developers.">
      <main className={styles.page}>
        <p className={styles.eyebrow}>DryvHub · Internal guide</p>
        <Heading as="h1" className={styles.title}>
          How the Dealer app and Marketplace work.
        </Heading>
        <p className={styles.subtitle}>
          Written for executives, support, and engineers. Start with the overview, or open the section for your role.
        </p>
        <div className={styles.actions}>
          <Link className="button button--primary" to="/docs/start/welcome">
            Start here
          </Link>
          <Link className="button button--secondary" to="/docs/start/glossary">
            Glossary
          </Link>
        </div>
        <Heading as="h2" id="paths-heading" className={styles.pathsHeading}>
          By role
        </Heading>
        <ul className={styles.pathList} aria-labelledby="paths-heading">
          {AUDIENCE_PATHS.map((path) => (
            <li key={path.to}>
              <Link className={styles.pathLink} to={path.to}>
                <span className={styles.pathTitle}>{path.title}</span>
                <span className={styles.pathDescription}>{path.description}</span>
                <span className={styles.pathCta} aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </Layout>
  );
}
