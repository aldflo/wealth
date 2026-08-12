import {
  useNavigate,
} from "react-router-dom";

import {
  auth,
} from "../firebase.config";

import ProjectGallery from "./ProjectGallery";


export default function ChatMessages({
  messages = [],
  onAction,
  memoriaProyecto = {},
  modoOscuro,
}) {
  const navigate =
    useNavigate();


  /* =========================================
     COTIZAR
  ========================================= */

  const irACotizacion = () => {

    const usuario =
      auth.currentUser;


    if (!usuario) {

      navigate(
        "/login",
        {
          state: {
            desdeIA: true,

            redirectTo:
              "/crear-cotizacion",

            memoriaProyecto,
          },
        }
      );

      return;
    }


    navigate(
      "/crear-cotizacion",
      {
        state: {
          desdeIA: true,

          memoriaProyecto,
        },
      }
    );
  };


  return (
    <div className="space-y-6 px-4 sm:px-6">

      {messages.map(
        (msg, index) => {

          const esUsuario =
            msg.role === "user";


          return (
            <div
              key={index}
              className={
                esUsuario
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >

              <div
                className={
                  esUsuario
                    ? "max-w-[80%] lg:max-w-[70%]"
                    : "w-full max-w-[900px]"
                }
              >

                {/* NOMBRE IA */}

                {!esUsuario && (
                  <div className="flex items-center gap-2 mb-2">

                    <div
                      className="
                        w-8
                        h-8
                        rounded-xl

                        bg-[#c89b3c]

                        text-black
                        font-black
                        text-xs

                        flex
                        items-center
                        justify-center
                      "
                    >
                      W
                    </div>

                    <span className="text-xs font-bold text-[#c89b3c]">
                      WEALTH IA
                    </span>

                  </div>
                )}


                {/* BURBUJA */}

                <div
                  className={
                    esUsuario
                      ? `
                        bg-[#c89b3c]
                        text-black

                        rounded-2xl
                        rounded-tr-md

                        px-5
                        py-4

                        text-sm
                        sm:text-base

                        leading-relaxed
                        whitespace-pre-wrap
                      `
                      : `
                        ${
                          modoOscuro
                            ? `
                              bg-[#171719]
                              text-zinc-200
                              border-zinc-800
                            `
                            : `
                              bg-white
                              text-gray-800
                              border-gray-200
                              shadow-sm
                            `
                        }

                        border

                        rounded-2xl
                        rounded-tl-md

                        px-5
                        py-4

                        text-sm
                        sm:text-base

                        leading-relaxed
                        whitespace-pre-wrap

                        transition-colors
                        duration-300
                      `
                  }
                >
                  {msg.content}
                </div>


                {/* ARCHIVOS / PROYECTOS */}

                {!esUsuario &&
                  Array.isArray(
                    msg.attachments
                  ) &&
                  msg.attachments.length >
                    0 && (

                    <ProjectGallery
                      projects={
                        msg.attachments
                      }

                      modoOscuro={
                        modoOscuro
                      }
                    />

                  )}


                {/* ACCIONES */}

                {!esUsuario &&
                  Array.isArray(
                    msg.actions
                  ) &&
                  msg.actions.length >
                    0 && (

                    <div className="flex flex-wrap gap-2 mt-4">

                      {msg.actions.map(
                        (
                          action,
                          actionIndex
                        ) => (

                          <button
                            key={
                              actionIndex
                            }

                            type="button"

                            onClick={() => {

                              if (
                                action.type ===
                                "cotizar"
                              ) {

                                irACotizacion();

                                return;
                              }


                              onAction?.(
                                action
                              );

                            }}

                            className={`
                              px-4
                              py-2.5

                              rounded-xl

                              border
                              border-[#c89b3c]/40

                              bg-[#c89b3c]/5

                              text-[#b98a2f]

                              text-sm
                              font-semibold

                              hover:bg-[#c89b3c]/12
                              hover:border-[#c89b3c]

                              transition

                              ${
                                modoOscuro
                                  ? "text-[#d6ab4c]"
                                  : "text-[#9c7427]"
                              }
                            `}
                          >

                            {
                              action.label
                            }

                          </button>

                        )
                      )}

                    </div>

                  )}

              </div>

            </div>
          );
        }
      )}

    </div>
  );
}