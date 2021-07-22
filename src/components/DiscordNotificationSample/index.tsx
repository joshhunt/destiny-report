import React from "react";

import s from "./styles.module.scss";

import emojiChanged from "./emoji/emoijChanged.png";
import emojiNew from "./emoji/emoijNew.png";
import emojiReclassified from "./emoji/emoijReclassifed.png";
import emojiRemoved from "./emoji/emoijRemoved.png";
import emojiUnclassified from "./emoji/emoijUnclassified.png";

interface DiscordNotificationSampleProps {}

interface EmojiProps {
  type: string;
}

const Emoji: React.FC<EmojiProps> = ({ type }) => {
  const EMOJIS: Record<string, string> = {
    added: emojiNew,
    modified: emojiChanged,
    reclassified: emojiReclassified,
    removed: emojiRemoved,
    unclassified: emojiUnclassified,
  };

  return (
    <span className={s.emoji}>
      <img src={EMOJIS[type]} />
    </span>
  );
};

const decorateWithEmoji = (str: string) => {
  const lastWord = str
    .split(" ")
    .pop()
    ?.replace(/[^\w\s]/gi, "");

  if (!lastWord) {
    return str;
  }

  return (
    <>
      <Emoji type={lastWord} /> {str}
    </>
  );
};

const f = (title: React.ReactNode, ...content: string[]) => ({
  title,
  content: content.reduce((acc, thisLine, index) => {
    const decorated = decorateWithEmoji(thisLine);
    if (index === 0) {
      return <>{decorated}</>;
    }

    return (
      <>
        {acc}
        <br />
        {decorated}
      </>
    );
  }, <></>),
});

const DiscordNotificationSample: React.FC<DiscordNotificationSampleProps> =
  () => {
    const fields = [
      f("Items", "43 added", "97 unclassified", "3 removed", "255 modified"),
      f("PresentationNodes", "9 added", "7 modified"),
      f("Triumphs", "29 modified"),
      f("Collectibles", "47 added", "26 unclassified", "5 modified"),
      f("Activities", "1 added", "1 removed", "8 modified"),
      f("Lore", "17 unclassified", "3 modified"),
    ];

    return (
      <DiscordEmbed
        title="Definitions have updated!"
        link="https://archive.destiny.report/version/1a7d8d39-ca62-40af-becd-98bca27ed617"
        fields={fields}
      >
        <>
          <strong>ID:</strong> 1a7d8d39-ca62-40af-becd-98bca27ed617
          <br />
          <strong>Version:</strong> 94996.21.06.22.1900-3-bnet.38484
        </>
      </DiscordEmbed>
    );
  };

export default DiscordNotificationSample;

interface DiscordField {
  title: React.ReactNode;
  content: React.ReactNode;
}

interface DiscordEmbedProps {
  title?: React.ReactNode;
  link?: string;
  fields?: DiscordField[];
}

const DiscordEmbed: React.FC<DiscordEmbedProps> = ({
  title,
  link,
  fields,
  children,
}) => {
  return (
    <div className={s.root}>
      <div className={s.content}>
        {link && (
          <div className={s.title}>
            {link ? <a href={link}>{title}</a> : title}
          </div>
        )}

        {children && <div className={s.description}>{children}</div>}

        {fields && fields.length > 0 && (
          <div className={s.fields}>
            {fields.map((v, index) => (
              <DiscordField key={index} title={v.title} content={v.content} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface DiscordFieldProps {
  title: React.ReactNode;
  content: React.ReactNode;
}

const DiscordField: React.FC<DiscordFieldProps> = ({ content, title }) => {
  return (
    <div className={s.field}>
      <div className={s.fieldTitle}>{title}</div>

      <div className={s.fieldContent}>{content}</div>
    </div>
  );
};
