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
  const [tagsDict, setTagsDict] = useState({})
  const { api } = props
  
  useEffect(() => {
      if (tags) setTagsDict(tags.reduce((acc, tag) => ({ [tag._id]: tag, ...acc }), {}))
  }, [tags])

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
      setCurrentTag(null);
    }
    if (key.key === 'C' && frame > 0) {
      api.deleteTag(serie._id, {f:frame}).then(({ status, result }) => {
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

  const pointLineDistance = (p, pA, pB) => {
    const x = p.x - pA.x;
    const y = p.y - pA.y;
    const A = pB.x - pA.x;
    const B = pB.y - pA.y;
    const C = A * A + B * B;
    const dist = Math.abs(A * y - B * x) / Math.sqrt(C);
    return dist;
  }

  const pointInSection = (p, pA, pB) => {
    const {x,y} = p;
    const [xMin, xMax] = [pA.x, pB.x].sort();
    const [yMin, yMax] = [pA.y, pB.y].sort();
    if(!(xMin <= x && x <= xMax && yMin <= y && y <= yMax))
      return false;
    if(pointLineDistance(p, pA, pB) > 0.005)
      return false;
    return true;
  }

  const pointInPolyline = (p, polyline) => {
    for(let i = 0; i < polyline.length - 1; i++) {
      if(pointInSection(p, polyline[i], polyline[i+1]))
        return (polyline[i+1].i - polyline[i].i)/2 + polyline[i].i;
    }
    return false;
  }

  const onFrameMouseUp = (x, y) => {
    if (tagMode === "delete") {
      const tag = serieTags.find(t => 
        x - 0.005 < t.x && t.x < x + 0.005 && 
        y - 0.005 < t.y && t.y < y + 0.005 && 
        t.f === frame && !tagsDict[t.k].hidden);
      api.deleteTag(serie._id, {x:x, y:y, f:frame, k:tag.k}).then(({ status, result }) => status === 200 && setSerieTags(result.tags));
    } else if (tagMode === "move" && selectedTag !== null) {
      const tagElem = serieTags[selectedTag]
      tagElem['x'] = x
      tagElem['y'] = y
      api.updateTag(serie._id, selectedTag, tagElem).then(({ status, result }) => status === 200 && setSerieTags(result.tags));
      setSelectedTag(null);
    } else if (tagMode === "add" && currentTag) {
      const tagElem = { 'x': x, 'y': y, 'f': frame, 'k': currentTag._id };
      if (currentTag.l) {
        const sameKind = serieTags
          .filter(t => t.k === currentTag._id && t.f === frame)
          .sort((a, b) => a.i - b.i);
        tagElem['i'] = pointInPolyline(tagElem, sameKind) || sameKind.length;
      }
      api.addTag(serie._id, tagElem).then(({ status, result }) => status === 201 && setSerieTags(result.tags));
    }
  }

  const onFrameMouseDown = (x, y) => {
    if (tagMode === "move") {
      const i = serieTags.findIndex(t => 
          x - 0.005 < t.x && t.x < x + 0.005 && 
          y - 0.005 < t.y && t.y < y + 0.005 && 
          t.f === frame && !tagsDict[t.k].hidden);
      setSelectedTag(i < 0 ? null : i);
    }
    return tagMode !== "add" || currentTag;
  }

  const toogleDoubt = (_tag) => () => {
    const tag = serieTags.find(t => 
      t.x === -1 && t.y === -1 && 
      t.k === _tag._id && t.f === frame);
    if(tag)
      api.deleteTag(serie._id, {x:-1,y:-1}).then(({ status, result }) => status === 200 && setSerieTags(result.tags));
    else
      api.addTag(serie._id, {'x':-1, 'y':-1, 'f':frame, 'k':_tag._id}).then(({ status, result }) => status === 201 && setSerieTags(result.tags));
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
            setTag={setCurrentTag} currentTag={currentTag} serieTags={serieTags}
            updateTags={setTags} toogleDoubt={toogleDoubt}
            />
        </TabPanel>
      </Tabs>
      <Frame className={"MainFrame " + cursorClass} tagsDict={tagsDict} currentTag={currentTag}
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
