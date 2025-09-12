import {defineApp} from "@kubb/craft-core";
import {ReactTemplate} from "./ReactTemplate.tsx";
import {createElement} from "./index.ts";
import type { ElementType } from "react";

export const createApp= defineApp<ElementType>((container)=>{
  const template = new ReactTemplate({})

  return template.render(createElement(container))
})
