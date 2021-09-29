import { useState, useEffect } from 'react';
import useEventListener from '@use-it/event-listener'
import Frame from '../Components/frame';
import Select from '../Components/select';
import TagControl from '../Components/tagControl';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { addTag, updateTag, deleteTag } from '../model/api';
import 'react-tabs/style/react-tabs.css';
import './tagger.css';


function Tagger() {
  const [patient, setPatient] = useState(null);
  const [serie, setSerie] = useState(null);
  const [frame, setFrame] = useState(null);
  const [currentTag, setCurrentTag] = useState(null);
  const [tagMode, setTagMode] = useState(false);
  const [cursorClass, setCursorClass] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [tags, setTags] = useState([]);

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
      deleteTag(serie._id, x, y, frame).then(({ status, serie }) => status === 200 && setSerie(serie));
    } else if (tagMode === "move" && selectedTag!==null) {
      const tagElem = tags[selectedTag]
      tagElem['x'] = x
      tagElem['y'] = y
      updateTag(serie._id, selectedTag, tagElem).then(({ status, serie }) => status === 200 && setSerie(serie));
      setSelectedTag(null);
    } else if (tagMode === "add" && currentTag) {
      const tagElem = { 'x': x, 'y': y, 'f': frame, 'type': currentTag };
      if (currentTag.l) {
        tagElem['i'] = serie.tags.filter(t => t.type.n === currentTag.n).length;
      }
      addTag(serie._id, tagElem).then(({ status, serie }) => status === 201 && setSerie(serie));
    }
  }

  const onFrameMouseDown = (x, y) => {
    if (tagMode === "move") {
      const i = serie.tags.findIndex(t => x - 0.005 < t.x && t.x < x + 0.005 && y - 0.005 < t.y && t.y < y + 0.005 && t.f === frame);
      setSelectedTag(i < 0 ? null : i);
    }
  }

  const onFrameMouseMove = (x, y) => {
    if (tagMode === "move" && selectedTag!==null) {
      let t = tags[selectedTag]
      t['x'] = x
      t['y'] = y
      setTags(tags => [...tags, selectedTag=>t]);
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
      setTags(serie.tags);
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
          <Select serie={serie} patient={patient} onPatientSelected={setPatient} onSerieSelected={handleSerieSelected} />
        </TabPanel>
        <TabPanel>
          <TagControl serie={serie} frame={frame} setTag={setCurrentTag} currentTag={currentTag} />
        </TabPanel>
      </Tabs>
      <Frame className={"MainFrame " + cursorClass} 
        serie={serie} tags={tags} frame={frame}
        onFrameMouseDown={onFrameMouseDown}
        onFrameMouseUp={onFrameMouseUp}
        onFrameMouseMove={onFrameMouseMove}
      />
    </div>
  );
}

export default Tagger;
