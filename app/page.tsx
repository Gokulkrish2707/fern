"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F6EEDF] flex items-center justify-center p-6">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="bg-[#FFF8F0] rounded-[40px] shadow-2xl p-8 max-w-sm w-full text-center"
      >

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          }}
        >
          <Image
            src="/bear.png"
            alt="Bear"
            width={220}
            height={220}
            className="mx-auto"
          />
        </motion.div>

        <h1 className="text-4xl font-bold text-[#5C4033] mt-4">
          Good Morning 🌿
        </h1>

        <p className="text-[#7A5C4D] mt-3 text-lg">
          what vibe are we feeling today?
        </p>

      </motion.div>

    </main>
  )
}