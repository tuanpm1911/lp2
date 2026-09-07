'use client';

import { Render, type Data } from '@puckeditor/core';
import { puckConfig } from '@/lib/puck-config';

export default function PublicRenderer({data}:{data:Data}){
  return <Render config={puckConfig} data={data} />;
}
