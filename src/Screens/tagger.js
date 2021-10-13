import { useState, useEffect } from 'react';
import useEventListener from '@use-it/event-listener'
import Frame from '../Components/frame';
import Select from '../Components/select';
import TagControl from '../Components/tagControl';
import Legend from '../Components/legend';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './tagger.css';


const Tagger = (props) => {
  const [patient, setPatient] = useState(null);
  const [serie, setSerie] = useState(null);
  const [frame, setFrame] = useState(null);
  const [currentTag, setCurrentTag] = useState(null);
  const [tagMode, setTagMode] = useState("add");
  const [cursorClass, setCursorClass] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [serieTags, setSerieTags] = useState([]);
  const [tags, setTags] = useState([]);
  const { api } = props


  useEffect(() => {
    api.getTags().then(setTags);
  }, [api]);

  useEventListener('keydown', (key) => {
    if (!serie) return;
    if (key.key === 'ArrowRight' && frame < serie.shape.f - 1) {
      setFrame(frame + 1);
    }
    if (key.key === 'ArrowLeft' && frame > 0) {
      setFrame(frame - 1);
    }
    if (key.key === 'Control') {
      setTagMode("delete");
    }
    if (key.key === 'Shift') {
      setTagMode("move");
    }
    if (key.key === 'Escape') {
      setSelectedTag(null);
    }
    if (key.key === 'C' && frame > 0) {
      api.deleteTag(serie._id, frame=frame).then(({ status, result }) => {
        if (status === 200) {
          result.tags
            .filter(tag => tag.f === frame-1)
            .forEach(tag => // TODO: implement addMany
              api.addTag(serie._id, {...tag, f: frame}).then(({ status, result }) => status === 201 && setSerieTags(result.tags))            
            );
        }
      });
    }
  });

  useEventListener('keyup', (key) => {
    if (key.key === 'Control' || key.key === 'Shift') {
      setTagMode("add");
    }
  });

  const handleSerieSelected = (serie) => {
    setSerie(serie);
    setFrame(0);
  }

  const onFrameMouseUp = (x, y) => {
    if (tagMode === "delete") {
      api.deleteTag(serie._id, x, y, frame).then(({ status, result }) => status === 200 && setSerieTags(result.tags));
    } else if (tagMode === "move" && selectedTag !== null) {
      const tagElem = serieTags[selectedTag]
      tagElem['x'] = x
      tagElem['y'] = y
      api.updateTag(serie._id, selectedTag, tagElem).then(({ status, result }) => status === 200 && setSerieTags(result.tags));
      setSelectedTag(null);
    } else if (tagMode === "add" && currentTag) {
      const tagElem = { 'x': x, 'y': y, 'f': frame, 'k': currentTag._id };
      if (currentTag.l) {
        tagElem['i'] = serieTags.filter(t => t.k === currentTag._id).length;
      }
      api.addTag(serie._id, tagElem).then(({ status, result }) => status === 201 && setSerieTags(result.tags));
    }
  }

  const onFrameMouseDown = (x, y) => {
    if (tagMode === "move") {
      const i = serieTags.findIndex(t => x - 0.005 < t.x && t.x < x + 0.005 && y - 0.005 < t.y && t.y < y + 0.005 && t.f === frame);
      setSelectedTag(i < 0 ? null : i);
    }
  }

  const onFrameMouseMove = (x, y) => {
    if (tagMode === "move" && selectedTag !== null) {
      let t = serieTags[selectedTag]
      t['x'] = x
      t['y'] = y
      setSerieTags(serieTags => [...serieTags, selectedTag => t]);
    }
  }

  useEffect(() => {
    if (tagMode === "delete") {
      setCursorClass('cursor-delete');
    } else if (tagMode === "move") {
      setCursorClass('cursor-move');
    } else if (currentTag) {
      setCursorClass('cursor-add');
    } else {
      setCursorClass('cursor-default');
    }
  }, [currentTag, tagMode]);

  useEffect(() => {
    if (serie) {
      setSerieTags(serie.tags);
    }
  }, [serie]);

  return (
    <div className="Tagger">
      <Tabs className="MainTab">
        <TabList>
          <Tab>
            Select
          </Tab>
          <Tab>
            Tag
          </Tab>
        </TabList>
        <TabPanel>
          <Select serie={serie} patient={patient} api={api}
            onPatientSelected={setPatient}
            onSerieSelected={handleSerieSelected} />
        </TabPanel>
        <TabPanel>
          <TagControl serie={serie} frame={frame} tags={tags}
            setTag={setCurrentTag} currentTag={currentTag} />
        </TabPanel>
      </Tabs>
      <Frame className={"MainFrame " + cursorClass} tags={tags}
        serie={serie} serieTags={serieTags} frame={frame} api={api}
        onFrameMouseDown={onFrameMouseDown}
        onFrameMouseUp={onFrameMouseUp}
        onFrameMouseMove={onFrameMouseMove}
      />
      <Legend />
    </div>
  );
}

export default Tagger;
