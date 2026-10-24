import type { Preview } from '@storybook/nextjs-vite';
import { fontVariables } from '../app/fonts';
import '../app/globals.css';

// The font variables go on <html>, as on the site: globals.css resolves
// --font-serif and --font-sans at :root, so a wrapper div would be too late.
document.documentElement.classList.add(...fontVariables.split(' '), 'antialiased');

/**
 * Every story renders on the same paper as a fact page: the page fonts, the
 * global stylesheet, and a column no wider than the article's, so a component
 * that looks right here looks right in a report.
 */
const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    options: { storySort: { order: ['Introduction', 'Foundations', 'Data', 'Maps', 'Timelines', 'Quotes', 'Claims', 'Existing'] } },
  },
  decorators: [
    (Story) => (
      <div className="sv-story">
        <div className="sv-wrap">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default preview;
