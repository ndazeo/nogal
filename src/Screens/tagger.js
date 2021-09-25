import { useState } from 'react';
import useEventListener from '@use-it/event-listener'
import Frame from '../Components/frame';
import Select from '../Components/select';
import TagControl from '../Components/tagControl';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './tagger.css';


function Tagger() {
  const [patient, setPatient] = useState(null);
  const [serie, setSerie] = useState(null);
  const [frame, setFrame] = useState(null);

  useEventListener('keydown', (key) => {
    if(!serie) return;
    if (key.key === 'ArrowRight' && frame < serie.shape.f - 1) {
      setFrame(frame + 1);
    }
    if (key.key === 'ArrowLeft' && frame > 0) {
      setFrame(frame - 1);
    }
  });


  const handleSerieSelected = (serie) => {
    setSerie(serie);
    setFrame(0);
  }

  const handleFrameClick = (x,y) => {
    
  }
  
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
          <TagControl serie={serie} frame={frame} />
        </TabPanel>
        </Tabs>
        <Frame class="MainFrame" serie={serie} frame={frame} onClick={handleFrameClick} />
    </div>
  );
}

export default Tagger;
