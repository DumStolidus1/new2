// Smooth scroll with header offset, active link highlighting, and cursor glow

;(() => {
  const header = document.querySelector(".site-header")
  const links = document.querySelectorAll(".nav-link")
  const glow = document.getElementById("cursor-glow")
  const year = document.getElementById("year")
  const toTop = document.getElementById("toTop")
  const navToggle = document.querySelector(".nav-toggle")
  const nav = document.getElementById("primary-nav")
  const backdrop = document.getElementById("nav-backdrop")

  // Footer year
  if (year) {
    year.textContent = new Date().getFullYear()
  }

  // Smooth scroll with offset for sticky header
  function smoothScrollTo(targetId) {
    const el = document.getElementById(targetId)
    if (!el) return

    const headerHeight = header?.offsetHeight || 0
    const rect = el.getBoundingClientRect()
    const absoluteY = window.pageYOffset + rect.top
    const y = absoluteY - (headerHeight + 12)

    window.scrollTo({ top: y, behavior: "smooth" })
  }

  links.forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href") || ""
      if (href.startsWith("#")) {
        e.preventDefault()
        const id = href.slice(1)
        smoothScrollTo(id)
        history.pushState(null, "", `#${id}`)
        if (document.body.classList.contains("menu-open")) closeMenu()
      }
    })
  })

  // IntersectionObserver to highlight current nav link
  const sections = ["services", "pricing", "payments", "videos", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean)

  const linkMap = new Map(Array.from(links).map((a) => [a.getAttribute("href")?.replace("#", ""), a]))

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id
        const link = linkMap.get(id)
        if (!link) return
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"))
          link.classList.add("active")
        }
      })
    },
    {
      rootMargin: "-50% 0px -40% 0px",
      threshold: 0.02,
    },
  )

  sections.forEach((s) => observer.observe(s))

  // Cursor glow tracking (respect reduced motion)
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const isTouch = "ontouchstart" in window || (navigator.maxTouchPoints || 0) > 0

  if (glow && !prefersReducedMotion && !isTouch) {
    function moveGlow(e) {
      const x = e.clientX - glow.offsetWidth / 2
      const y = e.clientY - glow.offsetHeight / 2
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }

    document.addEventListener("mousemove", moveGlow)
    document.addEventListener("mouseenter", () => {
      glow.style.opacity = "0.85"
    })
    document.addEventListener("mouseleave", () => {
      glow.style.opacity = "0"
    })
  } else if (glow) {
    glow.style.display = "none"
  }

  // Optional: warn if video links are still placeholders
  const videoCards = document.querySelectorAll(".video-card")
  videoCards.forEach((card) => {
    const href = card.getAttribute("href")
    if (href === "#" || !href) {
      card.setAttribute("title", "Replace this link with your video URL.")
    }
  })

  // Additional update: Add a function to handle external links
  function handleExternalLinks() {
    const externalLinks = document.querySelectorAll(".external-link")
    externalLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        window.open(link.href, "_blank")
      })
    })
  }

  handleExternalLinks()

  // Copy Discord handle button behavior (no email)
  document.addEventListener("click", async (e) => {
    const btn = e.target instanceof Element ? e.target.closest(".copy-handle") : null
    if (!btn) return
    const handle = btn.getAttribute("data-handle") || ""
    try {
      if (navigator.clipboard && handle) {
        await navigator.clipboard.writeText(handle.replace(/^@/, ""))
        const old = btn.textContent
        btn.textContent = "Copied!"
        setTimeout(() => (btn.textContent = old || "Copy"), 1400)
      }
    } catch {}
  })

  // Copy generic text from data-copy attribute
  document.addEventListener("click", async (e) => {
    const target = e.target instanceof Element ? e.target : null
    if (!target) return

    const copyBtn = target.closest("[data-copy]")
    if (copyBtn) {
      const copySource = copyBtn.getAttribute("data-copy") || ""
      let toCopy = copySource
      if (toCopy.startsWith("#")) {
        const el = document.querySelector(copySource)
        toCopy = el?.textContent?.trim() || ""
      }
      try {
        if (navigator.clipboard && toCopy) {
          await navigator.clipboard.writeText(toCopy.replace(/^@/, ""))
          const old = copyBtn.textContent
          copyBtn.textContent = "Copied!"
          setTimeout(() => (copyBtn.textContent = old || "Copy"), 1400)
        }
      } catch {}
    }
  })

  // Back-to-top button show/hide and behavior
  function onScroll() {
    if (toTop) {
      if (window.scrollY > 400) {
        toTop.classList.add("visible")
      } else {
        toTop.classList.remove("visible")
      }
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true })
  onScroll()

  if (toTop) {
    toTop.addEventListener("click", (e) => {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    })
  }

  function openMenu() {
    document.body.classList.add("menu-open")
    navToggle?.setAttribute("aria-expanded", "true")
  }
  function closeMenu() {
    document.body.classList.remove("menu-open")
    navToggle?.setAttribute("aria-expanded", "false")
  }

  navToggle?.addEventListener("click", () => {
    if (document.body.classList.contains("menu-open")) closeMenu()
    else openMenu()
  })

  backdrop?.addEventListener("click", closeMenu)

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
      closeMenu()
    }
  })

  // close drawer when any nav link is clicked (safety)
  document.addEventListener("click", (e) => {
    const a = e.target instanceof Element ? e.target.closest(".nav-link") : null
    if (a && document.body.classList.contains("menu-open")) closeMenu()
  })

  // close drawer when resizing to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860 && document.body.classList.contains("menu-open")) {
      closeMenu()
    }
  })
})()
