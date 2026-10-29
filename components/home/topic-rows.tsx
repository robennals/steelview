import Link from 'next/link';
import { resolvePreviews, type PreviewSlide } from '@/lib/content/preview';
import { factSources, seriesSourceOffset } from '@/lib/content/sources';
import { topicPath, type Topic } from '@/lib/content/types';
import { ChartThumb } from '@/components/topic/chart-thumb';
import { ComparisonChart } from '@/components/topic/comparison-chart';
import { SeriesChart } from '@/components/topic/series-chart';
import { PreviewCarousel } from './preview-carousel';
import { TopicAccordion, TopicRow } from './topic-accordion';

/** How many chart silhouettes a closed row shows. */
const THUMBS = 3;

const updated = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** A preview slide's chart, through the same shared component the topic page uses. */
function SlideChart({ slide }: { slide: PreviewSlide }) {
  const { fact, chart } = slide;
  const preview = { href: slide.href.split('#')[0], reading: slide.reading };
  const seriesIndex = chart === 'series' ? -1 : (fact.additionalSeries ?? []).findIndex(s => s.id === chart);
  const series = chart === 'series' ? fact.series : fact.additionalSeries?.[seriesIndex];
  if (series) {
    return <SeriesChart factId={fact.id} chartId={chart === 'series' ? undefined : chart} series={series} sourceOffset={seriesSourceOffset(fact, seriesIndex)} sources={factSources(fact)} preview={preview} />;
  }
  const comparison = fact.comparisons?.find(c => c.id === chart);
  return comparison ? <ComparisonChart fact={{ id: fact.id }} chart={comparison} sources={factSources(fact)} preview={preview} /> : null;
}

/** The home page's topics, each a row; the first starts open. */
export function TopicRows({ topics }: { topics: Topic[] }) {
  if (topics.length === 0) return null;
  return (
    <TopicAccordion initial={topics[0].slug}>
      {topics.map(topic => {
        const slides = resolvePreviews(topic);
        return (
          <TopicRow
            key={topic.slug}
            slug={topic.slug}
            title={topic.title}
            href={topicPath(topic.slug)}
            subtitle={topic.subtitle}
            meta={
              <p className="sv-row__meta">
                {(topic.tags ?? []).map(tag => <span className="sv-tag" key={tag}>{tag}</span>)}
                <span>Updated {updated(topic.lastUpdated)}</span>
              </p>
            }
            thumbs={
              <ul className="sv-row__thumbs" aria-hidden="true">
                {slides.slice(0, THUMBS).map(slide => (
                  <li key={slide.href}>
                    <div className="sv-row__thumb"><ChartThumb fact={slide.fact} chart={slide.chart} reading={slide.reading} /></div>
                    <span>{slide.label}</span>
                  </li>
                ))}
              </ul>
            }
          >
            <div className="sv-row__columns">
              <PreviewCarousel name={topic.title} labels={slides.map(s => s.label)}>
                {slides.map(slide => (
                  <div className="sv-slide" key={slide.href}>
                    <SlideChart slide={slide} />
                  </div>
                ))}
              </PreviewCarousel>
              <div className="sv-row__side">
                <h3 className="sv-row__side-head">{plural(topic.viewpoints.length, 'viewpoint')}</h3>
                <ul className="sv-row__viewpoints">
                  {topic.viewpoints.map((v, i) => (
                    <li key={v.id}>
                      <i className="sv-row__marker" style={{ background: `var(--sv-series-${(i % 8) + 1})` }} />
                      <span>{v.name}</span>
                    </li>
                  ))}
                </ul>
                <Link className="sv-row__cta" href={topicPath(topic.slug)}>Read the full report <span aria-hidden="true">→</span></Link>
                <p className="sv-row__counts">
                  {plural(topic.viewpoints.length, 'viewpoint')} · {plural(topic.cruxes.length, 'disagreement')} · {plural(topic.facts.length, 'fact')}
                </p>
              </div>
            </div>
          </TopicRow>
        );
      })}
    </TopicAccordion>
  );
}
