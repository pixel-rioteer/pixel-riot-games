export default function GamingHub() {
  const featuredGames = [
    {
      title: 'Forza Horizon 5',
      genre: 'Racing',
      rating: '9.4',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop'
    },
    {
      title: 'Call of Duty: Warzone',
      genre: 'FPS',
      rating: '9.1',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop'
    },
    {
      title: 'Elden Ring',
      genre: 'RPG',
      rating: '9.7',
      image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=1200&auto=format&fit=crop'
    }
  ];

  const minecraftCommands = [
    '/gamemode creative',
    '/tp @p 100 64 100',
    '/give @p diamond_sword',
    '/weather clear',
    '/time set day'
  ];

  const guides = [
    'Best PvP Settings for Competitive Play',
    'How to Increase FPS on Low-End PCs',
    'Top 10 Hidden Features in Minecraft',
    'Best Builds and Cars in Forza Horizon 5',
    'Advanced Building Tricks for Survival Worlds'
  ];

  const serverReviews = [
    {
      name: 'Xynex Network',
      rating: '9.9/10',
      review: 'One of the best Minecraft servers for competitive PvP, events, custom content, and community tournaments.'
    },
    {
      name: 'BlockVerse SMP',
      rating: '9.5/10',
      review: 'Amazing survival economy and active community.'
    },
    {
      name: 'SkyRaid Network',
      rating: '8.9/10',
      review: 'Fast-paced PvP with balanced kits and smooth servers.'
    },
    {
      name: 'Pixel Kingdoms',
      rating: '9.2/10',
      review: 'Creative builds, events, and excellent moderation.'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <section className="relative h-[85vh] flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-blue-900">
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center" />

        <div className="relative z-10 text-center px-6">
          <h1 className="text-6xl md:text-8xl font-black tracking-tight bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
            PIXEL-RIOT
          </h1>

          <p className="mt-6 text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Reviews, guides, tips, tricks, esports news, Minecraft content, and exclusive gaming partnerships.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="/reviews" className="px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 transition-all text-black font-bold shadow-2xl shadow-cyan-500/40 inline-block">
              Explore Reviews
            </a>

            <a href="/minecraft" className="px-8 py-4 rounded-2xl border border-purple-500 hover:bg-purple-600/20 transition-all font-semibold inline-block">
              Minecraft Hub
            </a>
          </div>
        </div>
      </section>

      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-black text-cyan-400">PIXEL-RIOT</div>

          <div className="hidden md:flex gap-8 text-sm font-semibold text-gray-300">
            <a href="/reviews" className="hover:text-cyan-400 transition">Reviews</a>
            <a href="/guides" className="hover:text-cyan-400 transition">Guides</a>
            <a href="/minecraft" className="hover:text-cyan-400 transition">Minecraft</a>
            <a href="/news" className="hover:text-cyan-400 transition">News</a>
            <a href="/esports" className="hover:text-cyan-400 transition">Esports</a>
            <a href="/forums" className="hover:text-cyan-400 transition">Forums</a>
            <a href="/profiles" className="hover:text-cyan-400 transition">Profiles</a>
            <a href="/xynex" className="hover:text-cyan-400 transition">Xynex</a>
          </div>
        </div>
      </nav>

      <section id="reviews" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-5xl font-black">Featured Reviews</h2>
            <p className="text-gray-400 mt-2">Top-rated games this month.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredGames.map((game, index) => (
            <div
              key={index}
              className="group rounded-3xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:scale-[1.02]"
            >
              <div
                className="h-64 bg-cover bg-center"
                style={{ backgroundImage: `url(${game.image})` }}
              />

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">{game.title}</h3>
                  <span className="bg-cyan-500 text-black px-3 py-1 rounded-xl font-black">
                    {game.rating}
                  </span>
                </div>

                <p className="text-gray-400 mt-2">{game.genre}</p>

                <p className="mt-4 text-gray-300 leading-relaxed">
                  Deep mechanics, stunning visuals, and highly competitive gameplay make this one of the best releases this year.
                </p>

                <button className="mt-6 w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 transition-all font-bold">
                  Open Review Page
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="guides" className="bg-zinc-950 py-24 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-black mb-10">Tips, Tricks & Guides</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((guide, index) => (
              <div
                key={index}
                className="p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black hover:border-cyan-500 transition-all"
              >
                <div className="text-cyan-400 text-sm font-bold tracking-widest uppercase">
                  Strategy Guide
                </div>

                <h3 className="text-2xl font-bold mt-3">{guide}</h3>

                <p className="mt-4 text-gray-400 leading-relaxed">
                  Learn pro-level strategies, hidden techniques, advanced settings, and performance boosts.
                </p>

                <button className="mt-6 px-6 py-3 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-all">
                  View Full Guide
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="minecraft" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-4 h-16 bg-green-500 rounded-full"></div>
          <div>
            <h2 className="text-5xl font-black">Minecraft Hub</h2>
            <p className="text-gray-400 mt-2">
              Commands, tips & tricks, Xynex partnership content, and server reviews.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-3xl p-8 bg-gradient-to-br from-green-900/40 to-black border border-green-500/20">
            <h3 className="text-3xl font-bold mb-6 text-green-400">Popular Commands</h3>

            <div className="space-y-4">
              {minecraftCommands.map((cmd, index) => (
                <div
                  key={index}
                  className="bg-black/50 border border-white/10 px-5 py-4 rounded-2xl font-mono text-green-300"
                >
                  {cmd}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl p-8 bg-gradient-to-br from-emerald-900/30 to-black border border-emerald-500/20">
            <h3 className="text-3xl font-bold mb-6 text-emerald-400">Minecraft Tips & Tricks</h3>

            <div className="space-y-5 text-gray-300 leading-relaxed">
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
                Use water buckets to survive high falls and move faster through caves.
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
                Always carry torches and extra food when mining deep underground.
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
                Combine enchantments using anvils to build powerful endgame gear.
              </div>
            </div>
          </div>
        </div>

        <div
          id="partnership"
          className="mt-16 rounded-[40px] p-10 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-cyan-500/30"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div>
              <div className="text-cyan-400 uppercase tracking-[0.3em] font-bold text-sm">
                Official Partnership
              </div>

              <h2 className="text-5xl font-black mt-4">
                Powered By Xynex
              </h2>

              <p className="mt-6 text-gray-300 max-w-2xl text-lg leading-relaxed">
                Xynex partners with PIXEL-RIOT to bring exclusive Minecraft events, premium server showcases, community tournaments, and advanced gaming content.
              </p>

              <button className="mt-8 px-8 py-4 rounded-2xl bg-cyan-500 text-black font-black hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/30">
                Open Xynex Page
              </button>
            </div>

            <div className="relative">
              <img
                src="https://files.catbox.moe/placeholderxynex.png"
                alt="Xynex Logo"
                className="w-80 drop-shadow-[0_0_50px_rgba(34,211,238,0.6)]"
              />
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h3 className="text-4xl font-black mb-8">Server Reviews</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {serverReviews.map((server, index) => (
              <div
                key={index}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 hover:border-green-400 transition-all"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-2xl font-bold">{server.name}</h4>
                  <span className="bg-green-500 text-black px-3 py-1 rounded-xl font-black">
                    {server.rating}
                  </span>
                </div>

                <p className="mt-5 text-gray-300 leading-relaxed">
                  {server.review}
                </p>

                <button className="mt-6 w-full py-3 rounded-2xl bg-green-500 text-black font-bold hover:bg-green-400 transition-all">
                  Read Review
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
