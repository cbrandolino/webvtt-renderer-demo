import { AppBar, Tabs, Tab } from "@material-ui/core";
import { Fragment, ReactElement, Children, useState } from "react";
import Panel from './Panel';

const TabPanels = (
  { labels, children, orientation = 'horizontal', onChange }:
  { labels: Array<string>, children:Array<ReactElement>, orientation?: 'vertical' | 'horizontal', onChange?: (string) => void }
) => {
  const [activeTab, setTab] = useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
    onChange(newValue)
  };

  return (
    <Fragment>
      <Tabs value={activeTab} onChange={handleChange} orientation={orientation}>
        {
          labels.map(label => <Tab label={label} key={label} />)
        }
      </Tabs>

      {
        Children.map(children, (child:ReactElement, i:number):ReactElement => 
          <Panel index={i} activeTab={activeTab}>
            { child }
          </Panel>
        )
      }
    </Fragment>
  )

};

export default TabPanels;