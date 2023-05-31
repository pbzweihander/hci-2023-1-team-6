import { ReactElement, useState } from "react";
import Graph, {
  type Network,
  type Edge,
  type Node,
  type IdType,
  type GraphEvents,
} from "react-vis-graph-wrapper";

interface Relationship {
  toId: number;
  description: string;
}

interface Character {
  id: number;
  name: string;
  characteristics: string[];
  relationships: Relationship[];
}

function newCharacter(id: number): Character {
  return {
    id,
    name: `Character ${id + 1}`,
    characteristics: [],
    relationships: [],
  };
}

function renderNodeFromCharacter(character: Character): Node {
  return { id: character.id, label: character.name };
}

function renderEdgesFromCharacter(character: Character): Edge[] {
  return character.relationships.map((relationship) => ({
    from: character.id,
    to: relationship.toId,
    label: relationship.description,
    arrows: { to: true },
  }));
}

function Select({
  className,
  items,
  value,
  onChange,
}: {
  className: string;
  items: { value: string; label: string }[];
  value: string | undefined;
  onChange: (value: string) => void;
}): ReactElement {
  return (
    <select className={className} onChange={(e) => onChange(e.target.value)}>
      <option disabled selected={value === undefined}>
        Pick a character
      </option>
      {items.map((i, idx) => (
        <option key={idx} value={i.value} selected={value === i.value}>
          {i.label}
        </option>
      ))}
    </select>
  );
}

function App() {
  const [chapter, setChapter] = useState(0);
  const [charactersMap, setCharactersMap] = useState<{
    [chapter: number]: Character[];
  }>({});
  const [nextId, setNextId] = useState(0);
  const [network, setNetwork] = useState<Network | undefined>(undefined);
  const [selectedCharacterId, setSelectedCharacterId] = useState<
    IdType | undefined
  >(undefined);

  const modifyCharacter = (
    id: IdType | undefined,
    modify: (c: Character) => Character
  ): void => {
    if (id === undefined) {
      return;
    }
    setCharactersMap((map) => {
      const cs = map[chapter] ?? [];
      const c = cs.find((c) => c.id === id);
      if (c !== undefined) {
        return {
          ...map,
          [chapter]: [...cs.filter((c) => c.id !== id), modify(c)],
        };
      } else {
        return map;
      }
    });
  };

  const [inputName, setInputName] = useState("");
  const [inputCharacteristic, setInputCharacteristic] = useState("");
  const [inputRelationshipToId, setInputRelationshipToId] = useState<
    number | undefined
  >(undefined);
  const [inputRelationshipDescription, setInputRelationshipDescription] =
    useState("");

  const characters = charactersMap[chapter] ?? [];

  const selectedCharacter = characters.find(
    (character) => character.id === selectedCharacterId
  );

  const nodes = characters.map(renderNodeFromCharacter);
  const edges = characters.flatMap(renderEdgesFromCharacter);
  const events: GraphEvents = {
    select: (event) => {
      const id: IdType | undefined = event.nodes[0];
      setSelectedCharacterId(id);
      const c = characters.find((character) => character.id === id);
      if (c !== undefined) {
        setInputName(c.name);
      }
    },
  };

  return (
    <>
      <div className="navbar flex justify-center bg-slate-200 px-4">
        <button
          onClick={() => {
            setChapter((chapter) => {
              if (chapter <= 0) {
                return 0;
              } else {
                return chapter - 1;
              }
            });
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <span className="mx-5 text-xl">Chapter {chapter + 1}</span>
        <button
          onClick={() => {
            setChapter((chapter) => chapter + 1);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>
      <div className="flex h-[calc(100%-64px)] w-full">
        <div className="h-full flex-1 overflow-y-scroll bg-slate-100">
          {selectedCharacter !== undefined ? (
            <>
              <div className="p-2 text-xl">Name:</div>
              <div className="flex p-2">
                <input
                  type="text"
                  className="input mr-2 w-full"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                />
                <button
                  className="btn-primary btn mr-2"
                  onClick={() => {
                    modifyCharacter(selectedCharacterId, (c) => ({
                      ...c,
                      name: inputName,
                    }));
                  }}
                >
                  Save
                </button>
                <button className="btn-accent btn">Generate</button>
              </div>
              <div className="divider" />
              <div className="flex justify-center p-2">
                <div className="flex-grow">
                  <span className="mr-3 text-xl">Charateristics:</span>
                  <span className="text-lg">{inputName} ...</span>
                </div>
                <label
                  className="btn-sm btn-circle btn"
                  title="Add characteristic"
                  htmlFor="add-characteristic-modal"
                  onClick={() => {
                    setInputCharacteristic("");
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </label>
              </div>
              <ul className="px-4 py-2">
                {selectedCharacter.characteristics.map((ch) => (
                  <li key={ch} className="mb-2 flex">
                    <span className="flex-grow">{ch}</span>
                    <button
                      className="btn-error btn-xs btn-circle btn"
                      onClick={() => {
                        modifyCharacter(selectedCharacterId, (c) => ({
                          ...c,
                          characteristics: c.characteristics.filter(
                            (oCh) => oCh !== ch
                          ),
                        }));
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-6 w-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="divider" />
              <div className="flex justify-center p-2">
                <div className="flex-grow">
                  <span className="mr-3 text-xl">Relationships:</span>
                  <span className="text-lg">{inputName} and ...</span>
                </div>
                <label
                  className="btn-sm btn-circle btn"
                  title="Add relationship"
                  htmlFor="add-relationship-modal"
                  onClick={() => {
                    setInputRelationshipToId(undefined);
                    setInputRelationshipDescription("");
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </label>
              </div>
              <ul className="px-4 py-2">
                {selectedCharacter.relationships.map((r, idx) => (
                  <li key={idx} className="mb-2 flex">
                    <span className="flex-grow">
                      {characters.find((c) => c.id === r.toId)?.name}{" "}
                      {r.description}
                    </span>
                    <button
                      className="btn-error btn-xs btn-circle btn"
                      onClick={() => {
                        modifyCharacter(selectedCharacterId, (c) => ({
                          ...c,
                          relationships: c.relationships.filter(
                            (oR) =>
                              oR.toId !== r.toId &&
                              oR.description !== r.description
                          ),
                        }));
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-6 w-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="p-2 text-lg">Select a character to edit</div>
          )}
        </div>
        <div className="h-full flex-1">
          <Graph
            getNetwork={(network) => setNetwork(network)}
            graph={{ nodes, edges }}
            events={events}
          />
          <div className="absolute right-0 top-[64px] m-2">
            <button
              className="btn-circle btn mr-2"
              title="Add character"
              onClick={() => {
                setCharactersMap((map) => ({
                  ...map,
                  [chapter]: [...(map[chapter] ?? []), newCharacter(nextId)],
                }));
                setNextId((nextId) => nextId + 1);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </button>
            <button
              className="btn-circle btn"
              title="Move view to fit graph"
              onClick={() => {
                network?.fit({ animation: true });
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <input
        type="checkbox"
        id="add-characteristic-modal"
        className="modal-toggle"
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="mb-2 text-lg">
            <span className="mr-1 font-bold">Add characteristic for</span>
            {inputName}
          </h3>
          <div className="mb-1">{inputName} ...</div>
          <div>
            <input
              type="text"
              className="input-bordered input w-full"
              placeholder="is short tempered"
              value={inputCharacteristic}
              onChange={(e) => setInputCharacteristic(e.target.value)}
            />
          </div>
          <div className="flex">
            <span className="flex-grow" />
            <label
              className="btn-secondary modal-action btn mr-2"
              htmlFor="add-characteristic-modal"
            >
              Cancel
            </label>
            <label
              className="btn-primary modal-action btn"
              htmlFor="add-characteristic-modal"
              onClick={() => {
                modifyCharacter(selectedCharacterId, (c) => ({
                  ...c,
                  characteristics: [...c.characteristics, inputCharacteristic],
                }));
              }}
            >
              Save
            </label>
          </div>
        </div>
      </div>
      <input
        type="checkbox"
        id="add-relationship-modal"
        className="modal-toggle"
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="mb-2 text-lg">
            <span className="mr-1 font-bold">Add relationship for</span>
            {inputName}
          </h3>
          <div className="mb-1">{inputName} and ...</div>
          <Select
            className="select-bordered select mb-1 w-full"
            items={characters
              .filter((c) => c.id !== selectedCharacterId)
              .map((c) => ({ value: `${c.id}`, label: c.name }))}
            value={
              inputRelationshipToId !== undefined
                ? `${inputRelationshipToId}`
                : undefined
            }
            onChange={(v) => setInputRelationshipToId(Number(v))}
          />
          <div>
            <input
              type="text"
              className="input-bordered input w-full"
              placeholder="is a good friend"
              value={inputRelationshipDescription}
              onChange={(e) => setInputRelationshipDescription(e.target.value)}
            />
          </div>
          <div className="flex">
            <span className="flex-grow" />
            <label
              className="btn-secondary modal-action btn mr-2"
              htmlFor="add-relationship-modal"
            >
              Cancel
            </label>
            <label
              className="btn-primary modal-action btn"
              htmlFor="add-relationship-modal"
              onClick={() => {
                if (inputRelationshipToId === undefined) {
                  return;
                }
                if (inputRelationshipDescription === "") {
                  return;
                }
                modifyCharacter(selectedCharacterId, (c) => ({
                  ...c,
                  relationships: [
                    ...c.relationships,
                    {
                      toId: inputRelationshipToId,
                      description: inputRelationshipDescription,
                    },
                  ],
                }));
              }}
            >
              Save
            </label>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
