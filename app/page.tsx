import Link from "next/link";
import { ArrowRight, BookOpen, Users, Calendar, MessageSquare, Award } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50 selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Learn<span className="text-indigo-600 dark:text-indigo-400">Link</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/auth/login" 
              className="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Sign in
            </Link>
            <Link 
              href="/auth/register" 
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        {/* ... */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center mt-10">
          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl">
            The Ultimate Hub for <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">
              Student Collaboration
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Connect with peers, organize your studies, ask questions, and climb the leaderboard. LearnLink is designed to make your academic journey smarter and more social.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/auth/register"
              className="group flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
            >
              Join for Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              href="/auth/login" 
              className="text-sm font-semibold leading-6 flex items-center gap-x-2 text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Explore platform <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-24 sm:py-32 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Tools to help you succeed together
            </p>
            <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Whether you're looking for a study partner, help with a difficult assignment, or simply trying to organize your week, we've got you covered.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  name: "Community Q&A",
                  description: "Ask questions, share knowledge, and solve problems together in our active forums.",
                  icon: Users,
                },
                {
                  name: "Smart Planner",
                  description: "Keep track of your assignments, exams, and personal study goals all in one calendar.",
                  icon: Calendar,
                },
                {
                  name: "Direct Messaging",
                  description: "Chat in real-time with classmates and study partners to coordinate study sessions.",
                  icon: MessageSquare,
                },
              ].map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20">
                      <feature.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-600 dark:text-zinc-400">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300">Terms</Link>
            <Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300">Privacy</Link>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              &copy; 2026 LearnLink. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
