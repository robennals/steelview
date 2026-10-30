import Link from 'next/link';
import { factSlides } from '@/lib/content/preview';
import { factPath, type Fact } from '@/lib/content/types';
import { PreviewCarousel } from '@/components/home/preview-carousel';
import { TopicAccordion, TopicRow } from '@/components/home/topic-accordion';
import { ChartThumb } from './chart-thumb';
import { SlideChart } from './slide-chart';

/** How many chart silhouettes a closed row shows. */
const THUMBS = 4;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

type DataRowsProps = { slug: string; facts: Fact[] };

/**
 * The Data section: one row per headline data collection, laid out like the
 * home page's topics. Closed, a row shows its title, its opening finding and
 * silhouettes of its first few charts; open, a carousel of every chart it
 * draws, beside a link to the whole collection. That link opens the collection
 * over this page, where its observations, method and sources are. Supporting
 * collections are read inside their parent, so they have no row of their own.
 */
export function DataRows({ slug, facts }: DataRowsProps) {
  return (
    <TopicAccordion initial="">
      {facts.map(fact => {
        const slides = factSlides(slug, fact);
        const href = factPath(slug, fact.id);
        return (
          <TopicRow
            key={fact.id}
            slug={fact.id}
            className="sv-row--data"
            title={fact.title ?? fact.claim}
            subtitle={fact.title ? fact.claim : ''}
            meta={<p className="sv-row__meta"><span>{plural(slides.length, 'chart')}</span></p>}
            thumbs={
              <ul className="sv-row__thumbs" aria-hidden="true">
                {slides.slice(0, THUMBS).map(slide => (
                  <li key={slide.href}>
                    <div className="sv-row__thumb"><ChartThumb fact={fact} chart={slide.chart} /></div>
                    <span>{slide.label}</span>
                  </li>
                ))}
              </ul>
            }
          >
            <div className="sv-row__columns">
              {slides.length > 0 && (
                <PreviewCarousel name={fact.title ?? fact.claim} labels={slides.map(s => s.label)}>
                  {slides.map(slide => <div className="sv-slide" key={slide.href}><SlideChart slide={slide} /></div>)}
                </PreviewCarousel>
              )}
              <div className="sv-row__side">
                <Link className="sv-row__cta" href={href} scroll={false}>Explore the data <span aria-hidden="true">→</span></Link>
              </div>
            </div>
          </TopicRow>
        );
      })}
    </TopicAccordion>
  );
}
