import { useState, useEffect } from 'react';
import useEventListener from '@use-it/event-listener'
import Frame from './Components/frame';
import Select from './Components/select';
import TagControl from './Components/tagControl';
import Legend from './Components/legend';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './tagger.css';


const SeriesTagger = (props) => {
  const [patient, setPatient] = useState(null);
  const [serie, setSerie] = useState(null);
  const [frame, setFrame] = useState(null);
  const [currentTag, setCurrentTag] = useState(null);
  const [tagMode, setTagMode] = useState("add");
  const [tagJump, setTagJump] = useState(false);
  const [cursorClass, setCursorClass] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [loading, setLoading] = useState(0);
  const [serieTags, setSerieTags] = useState([]);
  const [yankTags, setYankTags] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagsDict, setTagsDict] = useState({})
  const { api } = props
  
  useEffect(() => {
      if (tags) setTagsDict(tags.reduce((acc, tag) => ({ [tag._id]: tag, ...acc }), {}))
  }, [tags])

  useEffect(() => {
    api.getTags().then(setTags);
  }, [api]);

  useEventListener('keydown', async(key) => {
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
      setTagMode(mode => {
        if(mode !== "move") setSelectedTag(null);
        return "move";
      });
    }
    if (key.key === 'Escape') {
      setTagMode("add");
      setSelectedTag(null);
      setCurrentTag(null);
    }
    if (key.key.toUpperCase() === 'C' && frame > 0) {
      const { status, result } = await api.deleteTag(serie._id, {f:frame})
      const delete_result = result
      if (status === 200) {
        const new_tags = delete_result.tags
          .filter(tag => tag.f === frame-1)
          .map(tag => ({ ...tag, f: frame }));
    
        const { status, result } = await api.addTag(serie._id, new_tags)
        if(status === 201) 
          setSerieTags(result.tags)
      }
    }
    if (key.key.toUpperCase() === 'Y') {
      setYankTags(serieTags.filter(tag => tag.f === frame));
    }
    if (key.key.toUpperCase() === 'P') {
      const { status } = await api.deleteTag(serie._id, {f:frame})
      if (status === 200 || status === 404) {
        const new_tags = yankTags
          .map(tag => ({ ...tag, f: frame }));

        const { status, result } = await api.addTag(serie._id, new_tags)
        if(status === 201) 
          setSerieTags(result.tags)
      }
    }
    if (key.key.toUpperCase() === 'J') {
      setTagJump(tagJump => !tagJump);
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
      if(polyline[i].s === polyline[i+1].s && pointInSection(p, polyline[i], polyline[i+1]))
        return {
          i: (polyline[i+1].i - polyline[i].i)/2 + polyline[i].i,
          s: polyline[i].s
        };
    }
    if ( polyline.length ) {
      return {
        i: polyline[polyline.length - 1].i + 1,
        s: polyline[polyline.length - 1].s
      }
    }
    return {i: 0, s: 0};
  }

  const onFrameMouseUp = (x, y) => {
    if (tagMode === "delete") {
      const tag = serieTags.find(t => 
        x - 0.005 < t.x && t.x < x + 0.005 && 
        y - 0.005 < t.y && t.y < y + 0.005 && 
        t.f === frame && !tagsDict[t.k].hidden);
      if(tag) api.deleteTag(serie._id, {x:x, y:y, f:frame, k:tag.k}).then(({ status, result }) => status === 200 && setSerieTags(result.tags));
    } else if (tagMode === "move" && selectedTag !== null) {
      const tagElem = serieTags[selectedTag]
      tagElem['x'] = x
      tagElem['y'] = y
      api.updateTag(serie._id, selectedTag, tagElem).then(({ status, result }) => status === 200 && setSerieTags(result.tags));
      setSelectedTag(null);
    } else if (tagMode === "add" && currentTag) {
      setLoading(loading => loading + 1);
      const tagElem = { 'x': x, 'y': y, 'f': frame, 'k': currentTag._id };
      if (currentTag.l) {
        const sameKind = serieTags
          .filter(t => t.k === currentTag._id && t.f === frame && t.x >= 0)
          .sort((a, b) => a.i - b.i);
        if (tagJump && sameKind.length){
          tagElem['i'] = sameKind[sameKind.length - 1].i + 1;
          tagElem['s'] = sameKind[sameKind.length - 1].s + 1;
          setTagJump(false);
        } else {
          const {i, s} = pointInPolyline(tagElem, sameKind);
          tagElem['i'] = i;
          tagElem['s'] = s;
        }
      }
      api.addTag(serie._id, tagElem).then(({ status, result }) => {
        if(status === 201) setSerieTags(result.tags)
        setLoading(loading => loading - 1)
      });
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

  const onFrameMouseLeave = () => {
    setTagMode("add");
    setSelectedTag(null);
  }

  useEffect(() => {
    if(loading>0){
      setCursorClass('cursor-loading');
      return
    }
    if (tagMode === "delete") {
      setCursorClass('cursor-delete');
    } else if (tagMode === "move") {
      setCursorClass('cursor-move');
    } else if (currentTag) {
      if(tagJump){
        setCursorClass('cursor-jump');
      } else {
        setCursorClass('cursor-add');
      }
    } else {
      setCursorClass('cursor-grab');
    }
  }, [currentTag, tagMode, tagJump,loading]);

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
          <TagControl patient={patient} serie={serie} frame={frame} tags={tags}
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
        onFrameMouseLeave={onFrameMouseLeave}
      />
      <Legend />
    </div>
  );
}

export default SeriesTagger;
