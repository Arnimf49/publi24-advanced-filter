import React from "react";
import {CopyButton} from "../Common/CopyButton/CopyButton";
import type {SearchResult} from "../../core/linksFilter";
import type {ImageSearchDomain} from "./AdPanel.types";

type ClipboardEntry = {
  label: string;
  href: string;
};

type ResultsCopyProps = {
  dataWwid: string;
  title: string;
} & (
  | {
    kind: 'phone';
    searchLinks: SearchResult[];
  }
  | {
    kind: 'image';
    imageSearchDomains?: ImageSearchDomain[];
    analyzeImagesLoading?: boolean;
  }
);

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const buildClipboardContent = (entries: ClipboardEntry[]): {text: string; html: string} => {
  return {
    text: entries.map(({label}) => label).join('\n'),
    html: entries
      .map(({label, href}) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`)
      .join('<br>'),
  };
};

const getSearchLinkHref = (link: SearchResult): string => {
  return Array.isArray(link)
    ? new URL(link[1], 'https://www.google.com').href
    : link;
};

const getSearchLinkDisplay = (link: SearchResult): string => {
  return Array.isArray(link)
    ? link[0]
    : link.replace(/^https?:\/\/(www\.)?|^www\./, '');
};

const getPhoneEntries = (searchLinks: SearchResult[]): ClipboardEntry[] => {
  return searchLinks.map((link) => ({
    label: getSearchLinkDisplay(link),
    href: getSearchLinkHref(link),
  }));
};

const getImageEntries = (
  imageSearchDomains: ImageSearchDomain[] | undefined,
  analyzeImagesLoading: boolean,
): ClipboardEntry[] => {
  if (!imageSearchDomains) {
    return [];
  }

  return imageSearchDomains.flatMap((domainData) => {
    const domainName = domainData.rawDomain ?? domainData.domain;
    const flagPrefix = domainData.flag ? `${domainData.flag} ` : '';
    const visibleLinks = domainData.links.filter((linkData) => !(analyzeImagesLoading && linkData.isUnknown));

    return visibleLinks.map((linkData, index) => ({
      label: `${flagPrefix}${domainName} #${index + 1}`,
      href: linkData.link,
    }));
  });
};

const hasImageResults = (
  imageSearchDomains: ImageSearchDomain[] | undefined,
  analyzeImagesLoading: boolean,
): boolean => {
  return !!imageSearchDomains?.some((domainData) =>
    domainData.links.some((linkData) => !(analyzeImagesLoading && linkData.isUnknown))
  );
};

export const ResultsCopy: React.FC<ResultsCopyProps> = (props) => {
  if (props.kind === 'phone') {
    if (props.searchLinks.length === 0) {
      return null;
    }

    return (
      <CopyButton
        getContent={() => buildClipboardContent(getPhoneEntries(props.searchLinks))}
        dataWwid={props.dataWwid}
        title={props.title}
      />
    );
  }

  const analyzeImagesLoading = props.analyzeImagesLoading ?? false;

  if (!hasImageResults(props.imageSearchDomains, analyzeImagesLoading)) {
    return null;
  }

  return (
    <CopyButton
      getContent={() => buildClipboardContent(getImageEntries(props.imageSearchDomains, analyzeImagesLoading))}
      dataWwid={props.dataWwid}
      title={props.title}
    />
  );
};
