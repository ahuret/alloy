import { ChangeEvent, useState } from 'react';
import { useParams } from 'react-router-dom';
import AutoScroll from '@brianmcallister/react-auto-scroll';
import { faBroom, faBug, faCopy, faRoad, faStop } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Page from '../features/layout/Page';
import { useStreaming } from '../hooks/stream';

import styles from './Streaming.module.css';

function PageStreaming() {
  const { '*': componentID } = useParams();
  const [enabled, setEnabled] = useState(true);
  const [data, setData] = useState<string[]>([]);
  const [sampleProb, setSampleProb] = useState(1);
  const [sliderProb, setSliderProb] = useState(1);
  const [filterValue, setFilterValue] = useState('');
  const { loading, error } = useStreaming(String(componentID), enabled, sampleProb, setData);

  function toggleEnableButton() {
    if (enabled) {
      return (
        <div className={styles.debugLink}>
          <button className={styles.stopButton} onClick={() => setEnabled(false)}>
            Stop <FontAwesomeIcon icon={faStop} />
          </button>
        </div>
      );
    }
    return (
      <div className={styles.debugLink}>
        <button className={styles.resumeButton} onClick={() => setEnabled(true)}>
          Resume <FontAwesomeIcon icon={faRoad} />
        </button>
      </div>
    );
  }

  function handleSampleChange(e: ChangeEvent<HTMLInputElement>) {
    const sampleValue = parseFloat(e.target.value);
    setSliderProb(sampleValue);
  }

  function handleSampleChangeComplete() {
    setSampleProb(sliderProb);
    if (enabled) {
      setEnabled(false);
      setTimeout(() => setEnabled(true), 200);
    }
  }

  async function copyDataToClipboard(): Promise<void> {
    const dataToCopy = data.join('\n');

    try {
      await navigator.clipboard.writeText(dataToCopy);
    } catch (err) {
      console.error('Failed to copy data to clipboard: ', err);
    }
  }

  const samplingControl = (
    <div className={styles.sliderContainer}>
      <span className={styles.sliderLabel}>Sample rate: {Math.round(sliderProb * 100)}%</span>
      <input
        className={styles.slider}
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={sliderProb}
        onChange={handleSampleChange}
        onMouseUp={handleSampleChangeComplete}
      />
    </div>
  );

  function handleFilterChange(e: ChangeEvent<HTMLInputElement>) {
    setFilterValue(e.target.value.toLowerCase());
  }

  const filterControl = <input type="search" placeholder="Filter data..." onChange={handleFilterChange} minLength={0} />;

  const controls = (
    <>
      {filterControl}
      {samplingControl}
      {toggleEnableButton()}
      <div className={styles.debugLink}>
        <button className={styles.clearButton} onClick={() => setData([])}>
          Clear <FontAwesomeIcon icon={faBroom} />
        </button>
      </div>
      <div className={styles.debugLink}>
        <button className={styles.copyButton} onClick={copyDataToClipboard}>
          Copy <FontAwesomeIcon icon={faCopy} />
        </button>
      </div>
    </>
  );

  return (
    <Page name="Live Debugging" desc="Debug stream of data" icon={faBug} controls={controls}>
      {loading && <p>Streaming data...</p>}
      {error && <p>Error: {error}</p>}
      <AutoScroll className={styles.autoScroll} height={document.body.scrollHeight - 260}>
        {data
          .filter((n) => n.toLowerCase().includes(filterValue))
          .map((msg, index) => {
            return (
              <div className={styles.logLine} key={index}>
                {msg}
              </div>
            );
          })}
      </AutoScroll>
    </Page>
  );
}

export default PageStreaming;
