import React, {useEffect, useState} from 'react';
import {NimfomaneStorage} from '../../core/storage';
import {Panel} from './Panel';

type PanelRootProps = {
  id: string;
};

export const PanelRoot: React.FC<PanelRootProps> = ({ id }) => {
  const [_, setRenderCycle] = useState(0);

  const topic = NimfomaneStorage.getTopic(id);
  const phone = topic.isOfEscort && topic.ownerUser
    ? NimfomaneStorage.getEscort(topic.ownerUser).phone
    : topic.phone;

  useEffect(() => {
    const incrementRender = () => setRenderCycle(v => ++v);
    const topic = NimfomaneStorage.getTopic(id);

    NimfomaneStorage.onTopicChanged(id, incrementRender);

    if (topic.ownerUser) {
      NimfomaneStorage.onEscortChanged(topic.ownerUser, incrementRender);
    }

    return () => {
      NimfomaneStorage.removeOnTopicChanged(id, incrementRender);
      if (topic.ownerUser) {
        NimfomaneStorage.removeOnEscortChanged(topic.ownerUser, incrementRender);
      }
    };
  }, [id]);

  return <Panel phone={phone} />;
};
