import {
  useEditor,
  type KeyboardShortcutCommand,
  Extension,
  generateJSON,
} from "@tiptap/react";
import { AutoComplete } from "@/components/editor/editor-autocomplete";
import { defaultExtensions } from "@/components/editor/extensions";
import Placeholder from "@tiptap/extension-placeholder";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { TextSelection } from "prosemirror-state";
import { Markdown } from "tiptap-markdown";
import { isObjectType } from "remeda";
import { cn } from "@/lib/utils";

const PreventNavigateOnDragOver = (
  handleFiles: (files: File[]) => void | Promise<void>,
) => {
  return Extension.create({
    name: "preventNavigateOnDrop",
    addProseMirrorPlugins: () => {
      return [
        new Plugin({
          key: new PluginKey("preventNavigateOnDrop"),
          props: {
            handleDOMEvents: {
              dragover: (_view, event) => {
                if (event.dataTransfer?.types?.includes("Files")) {
                  event.preventDefault();

                  return true;
                }

                return false;
              },
              drop: (_view, event) => {
                const fileList = event.dataTransfer?.files;
                if (fileList && fileList.length) {
                  event.preventDefault();
                  event.stopPropagation();

                  const files = Array.from(fileList);
                  void handleFiles(files);

                  return true;
                }

                return false;
              },
            },
          },
        }),
      ];
    },
  });
};

const CustomModEnter = (onModEnter: KeyboardShortcutCommand) => {
  return Extension.create({
    name: "handleModEnter",
    addKeyboardShortcuts: () => {
      return {
        "Mod-Enter": (props) => {
          return onModEnter(props);
        },
      };
    },
  });
};

const CustomModTab = (onTab: KeyboardShortcutCommand) => {
  return Extension.create({
    name: "handleTab",
    addKeyboardShortcuts: () => {
      return {
        Tab: (props) => {
          return onTab(props);
        },
      };
    },
  });
};

const MouseDownSelection = Extension.create({
  name: "mouseDownSelection",
  addProseMirrorPlugins: () => {
    return [
      new Plugin({
        key: new PluginKey("mouseDownSelection"),
        props: {
          handleDOMEvents: {
            mousedown: (view, event) => {
              const coords = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });

              if (coords) {
                const pos = coords.pos;
                const tr = view.state.tr;
                const selection = TextSelection.create(view.state.doc, pos);
                tr.setSelection(selection);
                view.dispatch(tr);
                view.focus();
              }

              return false;
            },
          },
        },
      }),
    ];
  },
});

const AutoCompleteExtension = ({
  sender,
  myInfo,
}: {
  sender?: {
    name?: string;
    email?: string;
  };
  myInfo?: {
    name?: string;
    email?: string;
  };
} = {}) => {
  return AutoComplete.configure({
    suggestions: {
      openers: [
        "Hi there,",
        "Hello,",
        "Dear",
        "Greetings,",
        "Good morning,",
        "Good afternoon,",
        "Good evening,",
      ],
      closers: [
        "Best regards,",
        "Kind regards,",
        "Sincerely,",
        "Thanks,",
        "Thank you,",
        "Cheers,",
      ],
      custom: [
        "I hope this email finds you well.",
        "I look forward to hearing from you.",
        "Please let me know if you have any questions.",
      ],
    },
    sender,
    myInfo,
  });
};

const useComposeEditor = ({
  initialValue,
  isReadOnly,
  placeholder,
  onChange,
  onAttachmentsChange,
  onLengthChange,
  onBlur,
  onFocus,
  onKeydown,
  onMousedown,
  onModEnter,
  onTab,
  myInfo,
  sender,
  autofocus = false,
}: {
  initialValue?: Record<string, unknown> | string | null;
  isReadOnly?: boolean;
  placeholder?: string;
  // Events
  onChange?: (content: Record<string, unknown>) => void | Promise<void>;
  onAttachmentsChange?: (attachments: File[]) => void | Promise<void>;
  onLengthChange?: (length: number) => void | Promise<void>;
  onBlur?: NonNullable<Parameters<typeof useEditor>[0]>["onBlur"];
  onFocus?: NonNullable<Parameters<typeof useEditor>[0]>["onFocus"];
  onKeydown?: (event: KeyboardEvent) => void | Promise<void>;
  onMousedown?: (event: MouseEvent) => void | Promise<void>;
  // Keyboard Shortcuts
  onModEnter?: KeyboardShortcutCommand;
  onTab?: KeyboardShortcutCommand;
  // State Information
  myInfo?: {
    name?: string;
    email?: string;
  };
  sender?: {
    name?: string;
    email?: string;
  };
  autofocus?: boolean;
}) => {
  const extensions = [
    ...defaultExtensions,
    Markdown,
    AutoCompleteExtension({
      myInfo,
      sender,
    }),
    ...(onModEnter
      ? [
          CustomModEnter((props) => {
            return onModEnter(props);
          }),
        ]
      : []),
    ...(onTab
      ? [
          CustomModTab((props) => {
            return onTab(props);
          }),
        ]
      : []),
    ...(isReadOnly ? [] : [MouseDownSelection]),
    Placeholder.configure({
      placeholder,
    }),
    ...(onAttachmentsChange
      ? [
          PreventNavigateOnDragOver((files) => {
            onAttachmentsChange(files);
          }),
        ]
      : []),
  ];

  return useEditor({
    editable: !isReadOnly,
    autofocus: autofocus ? "end" : false,
    onCreate: ({ editor }) => {
      if (onLengthChange) {
        const content = editor.getText();
        void onLengthChange(content.length);
      }
      if (autofocus) {
        setTimeout(() => {
          editor.commands.focus("end");
        }, 100);
      }
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        void onChange(editor.getJSON());
      }

      if (onLengthChange) {
        const content = editor.getText();
        void onLengthChange(content.length);
      }
    },
    content: initialValue
      ? isObjectType(initialValue)
        ? initialValue
        : generateJSON(initialValue, extensions)
      : undefined,
    immediatelyRender: true,
    shouldRerenderOnTransaction: false,
    extensions,
    onFocus: isReadOnly ? undefined : onFocus,
    onBlur: isReadOnly ? undefined : onBlur,
    editorProps: {
      attributes: {
        class: cn(
          "prose dark:prose-invert prose-headings:font-title focus:outline-none max-w-full",
          isReadOnly && "pointer-events-none select-text",
        ),
      },
      handleDOMEvents: {
        mousedown: (_, event) => {
          if (onMousedown && !isReadOnly) {
            void onMousedown(event);
          }

          return false;
        },
        keydown: (_, event) => {
          if (onKeydown && !isReadOnly) {
            void onKeydown(event);
          }

          return false;
        },
      },
    },
  });
};

export default useComposeEditor;
