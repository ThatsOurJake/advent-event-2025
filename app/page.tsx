"use client";

import Link from "next/link";

const Home = () => {
  return (
    <>
      <div className="w-full py-4 flex gap-x-8 justify-center">
        <div className="p-4 text-center bg-lime-100 border-2 border-black rounded flex flex-col justify-center items-center">
          <p className="font-bold">Mined Ore:</p>
          <p>Mined Today: 3</p>
          <p>In Storage: 3</p>
        </div>
        <div className="p-4 text-center bg-lime-100 border-2 border-black rounded flex flex-col justify-center items-center">
          <p className="font-bold">Gift Mounds:</p>
          <p>Mined Today: 3</p>
          <p>In Storage: 3</p>
        </div>
        <div className="p-4 text-center bg-lime-100 border-2 border-black rounded flex flex-col justify-center items-center">
          <p className="font-bold">Wrapped Gifts:</p>
          <p>Mined Today: 3</p>
          <p>In Storage: 3</p>
        </div>
      </div>
      <div className="flex">
        <div className="p-2 border-2 rounded mx-2 bg-cyan-100">
          <p className="font-bold text-center text-xl">Chores List</p>
          <div className="flex justify-around">
            <Link href="/mine" className="p-2">
              <div className="h-full px-1 py-4 rounded border-2 cursor-pointer flex justify-center items-center flex-col bg-fuchsia-200 shadow">
                <img
                  src="/static/pickaxe.png"
                  className="w-1/2 mb-1"
                  aria-hidden
                />
                <p className="font-bold text-center">The Mines</p>
                <p className="my-1 italic text-sm text-center">
                  Produces "Ore"
                </p>
                <p className="text-sm text-center">
                  <span className="font-bold">1</span> person mining
                </p>
              </div>
            </Link>
            <Link href="/forge" className="p-2">
              <div className="h-full px-1 py-4 rounded border-2 cursor-pointer flex justify-center items-center flex-col bg-fuchsia-200 shadow">
                <img
                  src="/static/hammer.png"
                  className="w-1/2 mb-1"
                  aria-hidden
                />
                <p className="font-bold text-center">The Forge</p>
                <p className="my-1 italic text-sm text-center">
                  Produces "Gift Mounds" from "Ore"
                </p>
                <p className="text-sm text-center">
                  <span className="font-bold">4</span> people smelting
                </p>
              </div>
            </Link>
            <Link href="/wrap" className="p-2">
              <div className="h-full px-1 py-4 rounded border-2 cursor-pointer flex justify-center items-center flex-col bg-fuchsia-200 shadow">
                <img
                  src="/static/wrapping.png"
                  className="w-1/2 mb-1"
                  aria-hidden
                />
                <p className="font-bold text-center">Wrapping Station</p>
                <p className="my-1 italic text-sm text-center">
                  Produces "Wrapped Gifts" from "Gift Mounds"
                </p>
                <p className="text-sm text-center">
                  <span className="font-bold">4</span> people wrapping
                </p>
              </div>
            </Link>
            <a href="/sleigh" className="p-2">
              <div className="h-full px-1 py-4 rounded border-2 cursor-pointer flex justify-center items-center flex-col bg-fuchsia-200 shadow">
                <img
                  src="/static/sleigh.png"
                  className="w-1/2 mb-1"
                  aria-hidden
                />
                <p className="font-bold text-center">The Sleigh</p>
                <p className="my-1 italic text-sm text-center">
                  Gain Score from "Wrapped Gifts"
                </p>
                <p className="text-sm text-center">
                  <span className="font-bold">4</span> people packing
                </p>
              </div>
            </a>
          </div>
        </div>
        <div className="grid grid-rows-2 px-4">
          <div className="w-full py-2 bg-orange-100 rounded border-2">
            <p className="text-center font-bold">Bulletin board</p>
            <p className="px-4 text-center">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut
              malesuada pellentesque urna sit amet sollicitudin. Suspendisse
              suscipit laoreet finibus. Mauris gravida leo sed leo rutrum, non
              convallis dui venenatis. Nulla.
            </p>
          </div>
          <div className="py-2">
            <p>Top</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
