import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import styles from './hr.module.css';

const features = [
  {
    icon: UserGroupIcon,
    title: 'People, in sync',
    description: 'Keep employee access and day-to-day team operations in one clear place.',
  },
  {
    icon: ClipboardDocumentCheckIcon,
    title: 'Work that moves',
    description: 'Assign tasks, follow progress, and keep deadlines visible to the team.',
  },
  {
    icon: CalendarDaysIcon,
    title: 'Time away, handled',
    description: 'Submit leave requests and review decisions without losing the thread.',
  },
  {
    icon: BanknotesIcon,
    title: 'Salary, clearly tracked',
    description: 'Record salary credits and give employees a simple view of payment history.',
  },
];

export default function Home() {
  return (
    <main className={styles.homeContainer}>
      <header className={styles.siteHeader}>
        <Link className={styles.brand} to="/" aria-label="Employee & Project Management Platform home">
          <span className={styles.brandMark}><UserGroupIcon aria-hidden="true" /></span>
          <span>Employee &amp; Project<span className={styles.brandSecond}>Management Platform</span></span>
        </Link>
        <nav className={styles.headerActions} aria-label="Account access">
          <Link className={styles.textLink} to="/login/manager">Manager sign in</Link>
          <Link className={styles.headerButton} to="/login/employee">Employee sign in <ArrowRightIcon aria-hidden="true" /></Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span /> PEOPLE OPERATIONS, MADE CLEAR</p>
          <h1>Good work starts with <em>a better rhythm.</em></h1>
          <p className={styles.heroDescription}>
            Bring your people, projects, time off, and salary records into one thoughtful workspace—so everyone knows what needs attention.
          </p>
          <div className={styles.homeButtons}>
            <Link className={styles.primaryButton} to="/login/employee">Employee sign in <ArrowRightIcon aria-hidden="true" /></Link>
            <Link className={styles.secondaryButton} to="/login/manager">Manager workspace</Link>
          </div>
          <div className={styles.heroNote}><span className={styles.avatarStack}><i>e</i><i>m</i><i>t</i></span><span>One place for the work behind great teams.</span></div>
        </div>

        <div className={styles.heroVisual} aria-label="A preview of the team workspace">
          <div className={styles.visualGlow} />
          <div className={styles.previewCard}>
            <div className={styles.previewTop}><span className={styles.previewMark}><UserGroupIcon aria-hidden="true" /></span><span>Team overview</span><span className={styles.liveDot}>Workspace</span></div>
            <div className={styles.previewWelcome}><span>MONDAY, TEAM</span><strong>Make room for<br />your best work.</strong></div>
            <div className={styles.previewStats}>
              <div><span>PROJECTS</span><strong>In motion</strong><small>Tasks and deadlines</small></div>
              <div><span>PEOPLE</span><strong>In rhythm</strong><small>Leave and payroll</small></div>
            </div>
            <div className={styles.previewTask}><span className={styles.taskCheck}>✓</span><span><strong>Keep the team moving</strong><small>Assigned work, clearly tracked</small></span><span className={styles.taskArrow}>↗</span></div>
            <div className={styles.previewBottom}><span>PEOPLE</span><span className={styles.previewLine} /><span>PROJECTS</span><span className={styles.previewLine} /><span>PROGRESS</span></div>
          </div>
          <div className={styles.floatingBadge}><span>✓</span> Everything in its place</div>
        </div>
      </section>

      <section className={styles.featuresSection}>
        <div className={styles.sectionIntro}><p className={styles.eyebrow}>THE ESSENTIALS, TOGETHER</p><h2>Less chasing. More meaningful work.</h2><p>Everyday team operations, designed to feel straightforward.</p></div>
        <div className={styles.featureGrid}>
          {features.map(({ icon: Icon, title, description }, index) => (
            <article className={styles.featureCard} key={title}>
              <div className={styles.featureIcon}><Icon aria-hidden="true" /></div>
              <span className={styles.featureIndex}>0{index + 1}</span>
              <h3>{title}</h3><p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.closingSection}>
        <div><p className={styles.eyebrow}>A CALMER WAY TO WORK</p><h2>Make the workday<br />a little more human.</h2></div>
        <Link className={styles.closingLink} to="/login/manager">Open your workspace <ArrowRightIcon aria-hidden="true" /></Link>
      </section>

      <footer className={styles.homeFooter}><Link className={styles.footerBrand} to="/">Employee &amp; Project Management Platform</Link><span>People and projects, moving forward together.</span><span>© {new Date().getFullYear()}</span></footer>
    </main>
  );
}
