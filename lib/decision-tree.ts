export type OptionId = string

export interface DiagnosticOption {
  id: OptionId
  label: string
  description?: string
  icon?: string
}

export interface DiagnosticNode {
  id: string
  category: string
  question: string
  expertThought: string
  options: DiagnosticOption[]
  next: Record<OptionId, string> // optionId -> next nodeId or "RESULT:xxx"
}

export interface DiagnosticResult {
  id: string
  title: string
  description: string
  matchPercentage: number
  fixActions: string[]
  severity: "low" | "medium" | "high"
}

export const diagnosticNodes: Record<string, DiagnosticNode> = {
  start: {
    id: "start",
    category: "Power Check",
    question: "What color is your router's Power light?",
    expertThought:
      "Starting diagnosis with power status. This is the most fundamental check for any network device.",
    options: [
      {
        id: "solid_white",
        label: "Solid White",
        description: "Light is steady and white/green",
      },
      {
        id: "blinking_red",
        label: "Blinking Red",
        description: "Light is flashing red or amber",
      },
      {
        id: "off",
        label: "Off",
        description: "No light visible at all",
      },
    ],
    next: {
      solid_white: "internet_light",
      blinking_red: "RESULT:firmware_issue",
      off: "power_source",
    },
  },
  power_source: {
    id: "power_source",
    category: "Power Check",
    question: "Have you verified the power cable and outlet?",
    expertThought:
      "No power light indicates a hardware or power supply issue. Let's verify the power source before assuming device failure.",
    options: [
      {
        id: "cable_loose",
        label: "Cable Was Loose",
        description: "The power cable wasn't fully plugged in",
      },
      {
        id: "outlet_dead",
        label: "Outlet Has No Power",
        description: "Other devices also don't work on this outlet",
      },
      {
        id: "all_good",
        label: "Everything Looks Connected",
        description: "Cable is firm, outlet works with other devices",
      },
    ],
    next: {
      cable_loose: "RESULT:loose_cable",
      outlet_dead: "RESULT:power_outlet",
      all_good: "RESULT:hardware_failure",
    },
  },
  internet_light: {
    id: "internet_light",
    category: "ISP Signal",
    question: "What is the status of the Internet/WAN light?",
    expertThought:
      "Power check passed. Moving to ISP signal. The Internet/WAN light tells us if the router is receiving a signal from the modem or ISP.",
    options: [
      {
        id: "solid_on",
        label: "Solid On",
        description: "Internet light is steady",
      },
      {
        id: "blinking",
        label: "Blinking",
        description: "Internet light is flashing intermittently",
      },
      {
        id: "off",
        label: "Off",
        description: "Internet light is not lit",
      },
    ],
    next: {
      solid_on: "wifi_connection",
      blinking: "ethernet_check",
      off: "RESULT:isp_down",
    },
  },
  ethernet_check: {
    id: "ethernet_check",
    category: "ISP Signal",
    question: "Is the Ethernet cable from the modem to the router securely connected on both ends?",
    expertThought:
      "Intermittent WAN signal often points to a physical connection issue between the modem and router. Checking the cable integrity.",
    options: [
      {
        id: "secure",
        label: "Yes, Both Ends Are Secure",
        description: "I hear a click when I push them in",
      },
      {
        id: "loose",
        label: "One End Was Loose",
        description: "I found a loose connection and re-seated it",
      },
      {
        id: "damaged",
        label: "Cable Looks Damaged",
        description: "I see fraying, bending, or broken clips",
      },
    ],
    next: {
      secure: "RESULT:isp_intermittent",
      loose: "RESULT:loose_ethernet",
      damaged: "RESULT:replace_ethernet",
    },
  },
  wifi_connection: {
    id: "wifi_connection",
    category: "WiFi Signal",
    question: "Can your device see the WiFi network name (SSID) in the list of available networks?",
    expertThought:
      "Router power and ISP signal are both confirmed. Now checking the wireless broadcast. If the SSID is invisible, the radio may be disabled.",
    options: [
      {
        id: "visible",
        label: "Yes, I Can See It",
        description: "The network name appears in my WiFi list",
      },
      {
        id: "not_visible",
        label: "No, It's Not Showing",
        description: "I don't see my network name anywhere",
      },
      {
        id: "connected_no_internet",
        label: "Connected, But No Internet",
        description: "I'm connected to WiFi but can't browse",
      },
    ],
    next: {
      visible: "connection_speed",
      not_visible: "RESULT:ssid_hidden",
      connected_no_internet: "dns_check",
    },
  },
  dns_check: {
    id: "dns_check",
    category: "DNS & Routing",
    question: "Can you access websites by their IP address (e.g., typing 8.8.8.8 in a browser)?",
    expertThought:
      "Connected but no internet typically points to a DNS resolution failure or a routing issue. Testing direct IP access to isolate the problem.",
    options: [
      {
        id: "yes_ip_works",
        label: "Yes, IP Address Works",
        description: "I can access sites by IP but not by name",
      },
      {
        id: "no_ip_fails",
        label: "No, Nothing Loads",
        description: "Even direct IP addresses don't work",
      },
      {
        id: "unsure",
        label: "I'm Not Sure How",
        description: "I'd prefer a simpler diagnostic step",
      },
    ],
    next: {
      yes_ip_works: "RESULT:dns_failure",
      no_ip_fails: "RESULT:routing_issue",
      unsure: "RESULT:dns_failure",
    },
  },
  connection_speed: {
    id: "connection_speed",
    category: "Performance",
    question: "How would you describe your internet speed right now?",
    expertThought:
      "WiFi connection established and working. Evaluating performance quality to identify potential bandwidth or interference issues.",
    options: [
      {
        id: "normal",
        label: "Seems Normal",
        description: "Pages load quickly, videos stream fine",
      },
      {
        id: "slow",
        label: "Noticeably Slow",
        description: "Pages take a long time to load",
      },
      {
        id: "intermittent",
        label: "Drops In and Out",
        description: "Speed fluctuates or connection keeps dropping",
      },
    ],
    next: {
      normal: "RESULT:all_clear",
      slow: "device_count",
      intermittent: "RESULT:interference",
    },
  },
  device_count: {
    id: "device_count",
    category: "Performance",
    question: "How many devices are currently connected to your network?",
    expertThought:
      "Slow speeds can result from bandwidth saturation. Checking the number of connected devices to assess network load.",
    options: [
      {
        id: "few",
        label: "1-5 Devices",
        description: "Just a few personal devices",
      },
      {
        id: "moderate",
        label: "6-15 Devices",
        description: "A typical household with smart devices",
      },
      {
        id: "many",
        label: "15+ Devices",
        description: "Many IoT devices, smart home equipment, etc.",
      },
    ],
    next: {
      few: "RESULT:isp_throttle",
      moderate: "RESULT:bandwidth_saturation",
      many: "RESULT:network_overload",
    },
  },
}

export const diagnosticResults: Record<string, DiagnosticResult> = {
  firmware_issue: {
    id: "firmware_issue",
    title: "Router Firmware Error Detected",
    description:
      "A blinking red power light typically indicates a firmware crash or boot loop. The router is failing to complete its startup sequence.",
    matchPercentage: 85,
    fixActions: [
      "Hold the reset button for 30 seconds to perform a factory reset",
      "Check the manufacturer's website for a firmware recovery tool",
      "If the issue persists, the router may need to be replaced",
    ],
    severity: "high",
  },
  loose_cable: {
    id: "loose_cable",
    title: "Loose Power Connection Resolved",
    description:
      "The power cable was not fully seated. After re-seating the connection, the router should boot normally within 2-3 minutes.",
    matchPercentage: 95,
    fixActions: [
      "Ensure the cable clicks firmly into the router's power port",
      "Consider using a cable management solution to prevent future disconnections",
      "Verify the router boots with a solid power light",
    ],
    severity: "low",
  },
  power_outlet: {
    id: "power_outlet",
    title: "Power Outlet Issue",
    description:
      "The electrical outlet supplying power to the router is not functioning. This is a facility/electrical issue, not a network one.",
    matchPercentage: 90,
    fixActions: [
      "Try plugging the router into a different, known-working outlet",
      "Check your home's circuit breaker or fuse box",
      "Contact an electrician if multiple outlets are dead",
    ],
    severity: "medium",
  },
  hardware_failure: {
    id: "hardware_failure",
    title: "Possible Router Hardware Failure",
    description:
      "With a confirmed good power source and cable, the lack of any power light strongly suggests an internal hardware failure in the router.",
    matchPercentage: 80,
    fixActions: [
      "Try a different power adapter if your router model supports it",
      "Contact the router manufacturer for warranty service",
      "Consider purchasing a replacement router",
    ],
    severity: "high",
  },
  isp_down: {
    id: "isp_down",
    title: "ISP Connection Lost",
    description:
      "No WAN/Internet light means the router is not receiving any signal from your Internet Service Provider. This could be an outage or a modem issue.",
    matchPercentage: 85,
    fixActions: [
      "Power cycle the modem: unplug for 30 seconds, then reconnect",
      "Check your ISP's status page or call their support line for outage info",
      "Verify the coax/fiber cable to the modem is intact and connected",
    ],
    severity: "high",
  },
  isp_intermittent: {
    id: "isp_intermittent",
    title: "Intermittent ISP Signal",
    description:
      "The cable connections are secure, but the ISP signal is unstable. This typically indicates an issue on the provider's end or with the line coming into your home.",
    matchPercentage: 75,
    fixActions: [
      "Contact your ISP to run a line quality test from their end",
      "Request a technician visit to inspect the line from the street to your modem",
      "Ask your ISP to check for signal degradation at the node level",
    ],
    severity: "medium",
  },
  loose_ethernet: {
    id: "loose_ethernet",
    title: "Loose Ethernet Connection Resolved",
    description:
      "A loose Ethernet cable between the modem and router was causing the intermittent WAN signal. Re-seating the connection should restore stable service.",
    matchPercentage: 92,
    fixActions: [
      "Monitor the connection for the next 30 minutes to confirm stability",
      "If the cable clip is broken, replace the Ethernet cable",
      "Consider using a shorter cable to reduce strain on the connection",
    ],
    severity: "low",
  },
  replace_ethernet: {
    id: "replace_ethernet",
    title: "Replace Ethernet Cable",
    description:
      "A physically damaged Ethernet cable will cause unreliable data transmission, packet loss, and intermittent connectivity. The cable must be replaced.",
    matchPercentage: 88,
    fixActions: [
      "Replace the cable with a new Cat5e or Cat6 Ethernet cable",
      "Ensure the new cable has intact RJ45 connectors on both ends",
      "Route the cable to avoid sharp bends and foot traffic",
    ],
    severity: "medium",
  },
  ssid_hidden: {
    id: "ssid_hidden",
    title: "WiFi Network Not Broadcasting",
    description:
      "The router's wireless radio may be disabled, or the SSID broadcast is turned off. This can happen after a firmware update or accidental settings change.",
    matchPercentage: 82,
    fixActions: [
      "Log into the router admin panel (usually 192.168.1.1 or 192.168.0.1)",
      "Navigate to Wireless Settings and ensure the WiFi radio is enabled",
      "Check that 'Hide SSID' or 'Disable SSID Broadcast' is turned off",
    ],
    severity: "medium",
  },
  dns_failure: {
    id: "dns_failure",
    title: "DNS Resolution Failure",
    description:
      "Your device can reach the internet but cannot translate domain names to IP addresses. This is a DNS server issue.",
    matchPercentage: 90,
    fixActions: [
      "Change your DNS servers to Google (8.8.8.8) or Cloudflare (1.1.1.1)",
      "On your router: go to WAN/Internet settings and update DNS fields",
      "Flush DNS cache on your device: run 'ipconfig /flushdns' on Windows or 'sudo dscacheutil -flushcache' on Mac",
    ],
    severity: "medium",
  },
  routing_issue: {
    id: "routing_issue",
    title: "Network Routing Problem",
    description:
      "Despite being connected to WiFi, no traffic can reach the internet. This suggests a misconfigured gateway or a DHCP issue on the router.",
    matchPercentage: 78,
    fixActions: [
      "Restart the router to reset the DHCP lease and routing table",
      "Check if the router's WAN configuration matches your ISP requirements (DHCP vs PPPoE vs Static)",
      "If the issue persists, perform a factory reset and reconfigure",
    ],
    severity: "high",
  },
  interference: {
    id: "interference",
    title: "WiFi Interference Detected",
    description:
      "Intermittent speed drops usually indicate wireless interference from neighboring networks, appliances, or physical obstructions.",
    matchPercentage: 80,
    fixActions: [
      "Switch to the 5GHz band if your router supports dual-band",
      "Change the WiFi channel to a less congested one (1, 6, or 11 for 2.4GHz)",
      "Move the router away from microwaves, baby monitors, and thick walls",
    ],
    severity: "medium",
  },
  isp_throttle: {
    id: "isp_throttle",
    title: "Possible ISP Throttling",
    description:
      "With few devices and low load, slow speeds may indicate your ISP is throttling your connection or there's an issue with your plan's bandwidth.",
    matchPercentage: 72,
    fixActions: [
      "Run a speed test at speedtest.net and compare with your plan's promised speeds",
      "Try using a VPN to check if speeds improve (which would confirm throttling)",
      "Contact your ISP with the speed test results to dispute or upgrade",
    ],
    severity: "medium",
  },
  bandwidth_saturation: {
    id: "bandwidth_saturation",
    title: "Bandwidth Saturation",
    description:
      "With a moderate number of devices, your available bandwidth is being shared thin. Streaming, downloads, and smart devices are all competing for speed.",
    matchPercentage: 85,
    fixActions: [
      "Enable QoS (Quality of Service) on your router to prioritize important traffic",
      "Disconnect or limit bandwidth for devices not actively in use",
      "Consider upgrading to a higher-speed internet plan",
    ],
    severity: "medium",
  },
  network_overload: {
    id: "network_overload",
    title: "Network Overloaded",
    description:
      "15+ connected devices are overwhelming your router's processing capacity. Consumer routers typically handle 20-30 devices maximum.",
    matchPercentage: 88,
    fixActions: [
      "Upgrade to a mesh network system designed for high device counts",
      "Segment IoT devices onto a separate guest network",
      "Audit connected devices and remove any unknown or unused ones",
    ],
    severity: "high",
  },
  all_clear: {
    id: "all_clear",
    title: "Network Appears Healthy",
    description:
      "All diagnostic checks passed. Your router, ISP connection, WiFi, and speeds are all operating normally. The issue may be with a specific device or service.",
    matchPercentage: 95,
    fixActions: [
      "If issues persist on one device, restart that device's WiFi adapter",
      "Clear the browser cache and cookies on the affected device",
      "Try accessing the service on a different device to isolate the problem",
    ],
    severity: "low",
  },
}
