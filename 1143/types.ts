export type Section = [number, number];
export type DataSet = {
  sections: Section[];
  stones: Section[];
  goal: Section;
};
export type SectionNode = {
  section: Section | null;
  children: SectionNode[];
  parent: SectionNode | null;
  moved: boolean | null;
};
