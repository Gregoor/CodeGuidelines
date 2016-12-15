import React from 'react';
import styled from 'styled-components';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import {categoryTree, pointsByTagLevels} from './data';

const Center = styled.div`
  margin-left: auto;
  margin-right: auto;
  max-width: 600px;
`;

const Tag = styled.span`
  padding: 3px;
  color: ${(props) => ['#ffc107', '#ff9800', '#f44336'][props.level]};
  font-weight: bold;
`;

const UnstyledList = styled.ul`
  list-style: none;
  padding: 0;
`;

const Card = styled.div`
  position: relative;
  box-sizing: border-box;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  z-index: 1;
  font-size: 14px;
  font-weight: 400;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,.14),
    0 3px 1px -2px rgba(0,0,0,.2),
    0 1px 5px 0 rgba(0,0,0,.12);
  overflow: hidden;
  background: #fff;
`;

const CardText = styled.p`
  margin: 0;
  padding: 16px;
  line-height: 18px;
  font-size: 1rem;
  overflow: hidden;
  color: rgba(0,0,0,.54);
`;

const CardBorder = styled.div`
  border-top: 1px solid rgba(0,0,0,.1);
`;

const CardBreadcrumbs = styled(CardText)`
  padding: 8px 16px;
  color: rgba(0,0,0,0.34);
`;

const PointCardText = styled(CardText)`
  white-space: pre-wrap;
`;

const levelSymbols = ['👎', '🚩', '💣'];
const levelDescriptions = ['Minor issue', 'Minor-Major issue', 'Major issue'];

const PointCard = ({data}) => (
  <Card>
    {data.categoryPath && [
      <CardBreadcrumbs key="breadcrumbs">
        {data.categoryPath.join(' > ')}
      </CardBreadcrumbs>,
      <CardBorder key="border"/>
    ]}
    <PointCardText>{data.text}</PointCardText>
    <CardBorder/>
    {data.tagsByLevel && (
      <CardText>
        {data.tagsByLevel.map(([level, tags], i, array) => [
          <span key={level} style={{color: 'black'}} title={levelDescriptions[level]}>
            {levelSymbols[level]}
            {tags.map((tag, i) => [
              <Tag level={level}>{tag.name}</Tag>,
              i + 1 < tags.length && ' & '
            ])}
          </span>,
          i + 1 < array.length && [<br/>,<br/>]
        ])}
      </CardText>
    )}
  </Card>
);

const CategoryTree = ({data, depth = 1}) => {
  const Title = 'h' + depth;
  return (
    <UnstyledList>
      {data.map(({id, name, points, children}) => (
        <li key={id}>
          <Title>{name}</Title>
          {points.map((point) => [<PointCard key={point.id} data={point} withTags/>, <br/>])}
          <CategoryTree data={children} depth={depth + 1}/>
        </li>
      ))}
    </UnstyledList>
  );
};


export default () => (
  <Center>
    <Tabs>
      <TabList>
        <Tab>Categories</Tab>
        <Tab>Review Dimensions</Tab>
      </TabList>
      <TabPanel>
        <CategoryTree data={categoryTree}/>
      </TabPanel>
      <TabPanel>
        {pointsByTagLevels.map((tag) => (
          <div key={tag.id}>
            <h1>{tag.name}</h1>
            {tag.levelPoints.map(([level, points]) => (
              <div key={level}>
                <h2>{levelSymbols[level]} <Tag level={level}>{levelDescriptions[level]}</Tag></h2>
                {points.map((point) => [<PointCard key={point.id} data={point}/>, <br/>])}
              </div>
            ))}
          </div>
        ))}
      </TabPanel>
    </Tabs>
  </Center>
);