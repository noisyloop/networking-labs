/* ===========================================================================
 * DATA :: STUDY CONTENT (DOMAINS)
 * ========================================================================= */
export const DOMAINS = [
  {
    num: 1,
    name: "Network Fundamentals",
    weight: 20,
    blurb:
      "Models, addressing, subnetting, IPv6, Ethernet, media, wireless basics and virtualization — the bedrock the rest of the exam builds on.",
    sections: [
      {
        title: "OSI & TCP/IP models",
        blocks: [
          { p: "The OSI model is a 7-layer reference model. Memorize layers, PDUs, devices and example protocols. Mnemonic top→down: All People Seem To Need Data Processing." },
          {
            table: {
              head: ["#", "Layer", "PDU", "Devices", "Examples"],
              rows: [
                ["7", "Application", "Data", "Host", "HTTP, FTP, DNS, DHCP, SNMP"],
                ["6", "Presentation", "Data", "Host", "TLS/SSL, JPEG, ASCII, encryption"],
                ["5", "Session", "Data", "Host", "RPC, NetBIOS, session setup/teardown"],
                ["4", "Transport", "Segment", "Firewall (L4)", "TCP, UDP, ports"],
                ["3", "Network", "Packet", "Router, L3 switch", "IP, ICMP, OSPF"],
                ["2", "Data Link", "Frame", "Switch, bridge, NIC", "Ethernet, ARP, 802.1Q, STP"],
                ["1", "Physical", "Bits", "Hub, cables, repeater", "RJ45, fiber, signaling"],
              ],
            },
          },
          { h: "TCP/IP (DoD) model comparison" },
          {
            table: {
              head: ["TCP/IP layer", "Maps to OSI"],
              rows: [
                ["Application", "OSI 5-6-7"],
                ["Transport", "OSI 4"],
                ["Internet", "OSI 3"],
                ["Network Access / Link", "OSI 1-2"],
              ],
            },
          },
          { p: "Encapsulation adds headers going down the stack (data→segment→packet→frame→bits); de-encapsulation strips them going up." },
        ],
      },
      {
        title: "TCP vs UDP",
        blocks: [
          { p: "TCP is connection-oriented, reliable, ordered, flow-controlled. UDP is connectionless, best-effort, low overhead." },
          {
            table: {
              head: ["Attribute", "TCP", "UDP"],
              rows: [
                ["Header size", "20-60 bytes", "8 bytes"],
                ["Reliability", "ACKs, retransmit", "none"],
                ["Ordering", "sequence numbers", "none"],
                ["Flow control", "windowing", "none"],
                ["Use cases", "HTTP, SSH, SMTP, FTP", "DNS, DHCP, TFTP, VoIP, SNMP"],
              ],
            },
          },
          { h: "TCP header fields" },
          { ul: [
            "Source / Destination port (16 bits each)",
            "Sequence number / Acknowledgement number (32 bits)",
            "Data offset, Reserved, 9 control flags (URG, ACK, PSH, RST, SYN, FIN, ...)",
            "Window size, Checksum, Urgent pointer, Options",
          ] },
          { h: "3-way handshake (open)" },
          { code: "Client ──SYN (seq=x)──────────▶ Server\nClient ◀─SYN-ACK (seq=y,ack=x+1)─ Server\nClient ──ACK (ack=y+1)─────────▶ Server" },
          { h: "4-way teardown (close)" },
          { code: "A ──FIN──▶ B\nA ◀─ACK── B\nA ◀─FIN── B\nA ──ACK──▶ B   (TIME_WAIT on initiator)" },
        ],
      },
      {
        title: "IPv4 addressing",
        blocks: [
          { p: "32-bit address in dotted decimal. Classful ranges are legacy but still tested." },
          {
            table: {
              head: ["Class", "1st octet", "Default mask", "Purpose"],
              rows: [
                ["A", "1-126", "/8 255.0.0.0", "Large nets"],
                ["B", "128-191", "/16 255.255.0.0", "Medium nets"],
                ["C", "192-223", "/24 255.255.255.0", "Small nets"],
                ["D", "224-239", "n/a", "Multicast"],
                ["E", "240-255", "n/a", "Experimental"],
              ],
            },
          },
          { h: "Private ranges (RFC1918)" },
          { ul: [
            "10.0.0.0/8 (10.0.0.0 – 10.255.255.255)",
            "172.16.0.0/12 (172.16.0.0 – 172.31.255.255)",
            "192.168.0.0/16 (192.168.0.0 – 192.168.255.255)",
          ] },
          { kv: [
            ["127.0.0.0/8", "loopback"],
            ["169.254.0.0/16", "APIPA — auto-assigned when DHCP fails"],
            ["0.0.0.0", "this host / default route / unspecified"],
            ["255.255.255.255", "limited broadcast"],
          ] },
        ],
      },
      {
        title: "Subnetting deep dive (CIDR, VLSM, magic number)",
        blocks: [
          { p: "Hosts per subnet = 2^h − 2 (subtract network + broadcast). Subnets created = 2^s (bits borrowed)." },
          {
            table: {
              head: ["CIDR", "Mask", "Block", "Hosts"],
              rows: [
                ["/24", "255.255.255.0", "256", "254"],
                ["/25", "255.255.255.128", "128", "126"],
                ["/26", "255.255.255.192", "64", "62"],
                ["/27", "255.255.255.224", "32", "30"],
                ["/28", "255.255.255.240", "16", "14"],
                ["/29", "255.255.255.248", "8", "6"],
                ["/30", "255.255.255.252", "4", "2"],
                ["/31", "255.255.255.254", "2", "2* (RFC3021 ptp)"],
              ],
            },
          },
          { h: "Magic number method" },
          { p: "Magic number = 256 − (mask octet in the interesting position). Subnets increment by that number; broadcast = next network − 1." },
          { h: "Worked example: 192.168.10.0/26" },
          { code: "Mask 255.255.255.192  → magic = 256-192 = 64\nSubnet 0: 192.168.10.0    | hosts .1-.62   | bcast .63\nSubnet 1: 192.168.10.64   | hosts .65-.126 | bcast .127\nSubnet 2: 192.168.10.128  | hosts .129-.190| bcast .191\nSubnet 3: 192.168.10.192  | hosts .193-.254| bcast .255" },
          { h: "VLSM — match prefix to need" },
          { p: "Allocate largest subnets first. Example over 192.168.1.0/24: LAN-A needs 50 hosts → /26 (62). LAN-B 25 hosts → /27 (30). WAN link → /30 (2). Carve sequentially so blocks never overlap." },
        ],
      },
      {
        title: "IPv6",
        blocks: [
          { p: "128-bit address, hex, 8 groups of 16 bits. Rules: drop leading zeros in a group; one '::' collapses a run of all-zero groups." },
          { kv: [
            ["Global unicast", "2000::/3 — routable, public"],
            ["Unique local", "FC00::/7 (commonly FD00::/8) — private"],
            ["Link-local", "FE80::/10 — auto on every interface, not routed"],
            ["Multicast", "FF00::/8 (FF02::1 all nodes, FF02::2 all routers)"],
            ["Loopback", "::1/128"],
            ["Unspecified", "::/128"],
          ] },
          { h: "EUI-64" },
          { p: "Builds the 64-bit interface ID from a 48-bit MAC: split MAC in half, insert FFFE in the middle, then flip the 7th bit (U/L) of the first byte." },
          { code: "MAC  00:1A:2B:3C:4D:5E\nsplit  001A2B | 3C4D5E\ninsert 001A2B FFFE 3C4D5E\nflip 7th bit: 00→02\nEUI-64 = 021A:2BFF:FE3C:4D5E" },
          { h: "NDP (replaces ARP + more)" },
          { ul: [
            "NS / NA — Neighbor Solicitation/Advertisement (address resolution, DAD)",
            "RS / RA — Router Solicitation/Advertisement (gateway + prefix, SLAAC)",
            "Uses ICMPv6, multicast solicited-node FF02::1:FFxx:xxxx",
          ] },
          { p: "Dual stack runs IPv4 and IPv6 simultaneously. Tunneling (6to4, GRE, manual) carries IPv6 over an IPv4 network." },
        ],
      },
      {
        title: "Ethernet, framing & duplex",
        blocks: [
          { p: "MAC address = 48 bits: first 24 = OUI (vendor), last 24 = device. FF:FF:FF:FF:FF:FF = broadcast." },
          { h: "Ethernet II frame" },
          { code: "[Preamble 7][SFD 1][Dst MAC 6][Src MAC 6][Type 2][Payload 46-1500][FCS 4]" },
          { ul: [
            "CSMA/CD: legacy half-duplex collision handling (sense, transmit, detect, jam, back-off).",
            "Full duplex (modern switched links) = no collisions, CSMA/CD disabled.",
            "Duplex/speed mismatch → late collisions and slowness; set both ends the same or use autoneg on both.",
          ] },
        ],
      },
      {
        title: "Topologies, cabling & wireless basics",
        blocks: [
          { ul: [
            "Topologies: star (most common LAN), mesh/partial mesh (WAN redundancy), bus/ring (legacy), hub-and-spoke, three-tier (access/distribution/core) and collapsed core.",
          ] },
          { h: "Copper cable selection" },
          { kv: [
            ["Straight-through", "unlike devices: PC↔switch, switch↔router"],
            ["Crossover", "like devices: switch↔switch, PC↔PC, router↔router (Auto-MDIX often hides this)"],
            ["Rollover", "console cable PC↔router/switch console port"],
          ] },
          { p: "Fiber: single-mode (SMF, long haul, laser) vs multimode (MMF, shorter, LED). Immune to EMI, higher bandwidth/distance than copper." },
          { h: "Wireless 802.11" },
          {
            table: {
              head: ["Std", "Band", "Max (typical)"],
              rows: [
                ["802.11b", "2.4 GHz", "11 Mbps"],
                ["802.11g", "2.4 GHz", "54 Mbps"],
                ["802.11n (Wi-Fi 4)", "2.4/5 GHz", "600 Mbps"],
                ["802.11ac (Wi-Fi 5)", "5 GHz", "~3.5 Gbps"],
                ["802.11ax (Wi-Fi 6/6E)", "2.4/5/6 GHz", "~9.6 Gbps"],
              ],
            },
          },
          { ul: [
            "2.4 GHz non-overlapping channels: 1, 6, 11.",
            "SSID = network name; BSSID = AP radio MAC; BSS = one AP cell; ESS = multiple APs same SSID.",
          ] },
        ],
      },
      {
        title: "Virtualization & cloud",
        blocks: [
          { ul: [
            "VM = full guest OS on a hypervisor (Type 1 bare-metal e.g. ESXi; Type 2 hosted e.g. VirtualBox).",
            "Container = shares host kernel, packages app + deps; lighter and faster than a VM (Docker).",
            "vSwitch = software switch connecting VMs to physical NICs.",
            "NFV = network functions (router/firewall/LB) as software instances instead of dedicated hardware.",
          ] },
          { p: "Cloud service models: IaaS (VMs/network), PaaS (runtime/platform), SaaS (finished app). Deployment: public, private, hybrid." },
        ],
      },
    ],
  },
  {
    num: 2,
    name: "Network Access",
    weight: 20,
    blurb:
      "Switching: VLANs, trunking, spanning tree, EtherChannel, and the wireless LAN architecture / AP modes.",
    sections: [
      {
        title: "VLANs & inter-VLAN routing",
        blocks: [
          { p: "A VLAN is a logical Layer-2 broadcast domain. Devices in different VLANs need a Layer-3 device to communicate." },
          { code: "Switch(config)# vlan 10\nSwitch(config-vlan)# name SALES\nSwitch(config)# interface fa0/1\nSwitch(config-if)# switchport mode access\nSwitch(config-if)# switchport access vlan 10" },
          { h: "Inter-VLAN routing options" },
          { ul: [
            "Router-on-a-stick: one router subinterface per VLAN over an 802.1Q trunk.",
            "Layer-3 switch with SVIs (interface vlan X) — preferred, line-rate.",
          ] },
          { code: "! router-on-a-stick\nR(config)# interface g0/0.10\nR(config-subif)# encapsulation dot1Q 10\nR(config-subif)# ip address 10.0.10.1 255.255.255.0" },
          { h: "Voice VLAN" },
          { code: "interface fa0/5\n switchport mode access\n switchport access vlan 20\n switchport voice vlan 110" },
        ],
      },
      {
        title: "Trunking (802.1Q, native VLAN, DTP)",
        blocks: [
          { p: "A trunk carries multiple VLANs between switches. 802.1Q inserts a 4-byte tag with the VLAN ID. The native VLAN (default 1) is sent untagged." },
          { code: "Switch(config-if)# switchport mode trunk\nSwitch(config-if)# switchport trunk native vlan 99\nSwitch(config-if)# switchport trunk allowed vlan 10,20,30" },
          { ul: [
            "Native VLAN must match on both ends or CDP logs a mismatch; mismatch enables VLAN hopping.",
            "DTP auto-negotiates trunking (dynamic auto / desirable). Best practice: hard-set mode and 'switchport nonegotiate' to disable DTP.",
          ] },
        ],
      },
      {
        title: "Spanning Tree (STP/RSTP)",
        blocks: [
          { p: "STP (802.1D) prevents Layer-2 loops by blocking redundant paths. RSTP (802.1w) is the faster modern default." },
          { h: "Root bridge election" },
          { ul: [
            "Lowest Bridge ID wins. BID = priority (default 32768) + VLAN (extended system ID) + MAC.",
            "Tune with 'spanning-tree vlan 1 priority 4096' (multiples of 4096), or 'root primary'.",
          ] },
          { h: "Port roles (RSTP)" },
          { kv: [
            ["Root port", "best (lowest cost) path TO the root — one per non-root switch"],
            ["Designated port", "forwarding port per segment (all root-bridge ports)"],
            ["Alternate port", "backup path to root (blocking), replaces RP fast"],
            ["Backup port", "backup to a segment on the same switch (rare, hubs)"],
          ] },
          { h: "Port states" },
          {
            table: {
              head: ["802.1D", "802.1w (RSTP)"],
              rows: [
                ["Blocking / Listening", "Discarding"],
                ["Learning", "Learning"],
                ["Forwarding", "Forwarding"],
              ],
            },
          },
          { h: "Path cost (higher speed = lower cost)" },
          { kv: [
            ["10 Mbps", "100"],
            ["100 Mbps", "19"],
            ["1 Gbps", "4"],
            ["10 Gbps", "2"],
          ] },
          { h: "Edge port protection" },
          { ul: [
            "PortFast: access/edge ports skip to forwarding immediately (host ports only).",
            "BPDU Guard: err-disables a PortFast port if it receives a BPDU (rogue switch protection).",
          ] },
          { code: "interface fa0/1\n spanning-tree portfast\n spanning-tree bpduguard enable" },
        ],
      },
      {
        title: "EtherChannel (LACP / PAgP)",
        blocks: [
          { p: "Bundles up to 8 physical links into one logical link; STP treats it as a single port (no blocking). All member ports must match: speed, duplex, mode, allowed VLANs." },
          {
            table: {
              head: ["Protocol", "Modes", "Standard"],
              rows: [
                ["LACP", "active / passive", "802.3ad (open)"],
                ["PAgP", "desirable / auto", "Cisco proprietary"],
                ["Static", "on", "no negotiation"],
              ],
            },
          },
          { ul: [
            "LACP forms: active+active, active+passive. (passive+passive fails.)",
            "PAgP forms: desirable+desirable, desirable+auto. (auto+auto fails.)",
            "Load-balance methods: src/dst MAC or IP (e.g. 'port-channel load-balance src-dst-ip').",
          ] },
          { code: "interface range g0/1 - 2\n channel-group 1 mode active\ninterface port-channel 1\n switchport mode trunk" },
        ],
      },
      {
        title: "Wireless LAN architecture",
        blocks: [
          { ul: [
            "Autonomous AP: standalone, each AP managed individually (CLI/GUI).",
            "Controller-based (lightweight) AP: managed centrally by a WLC.",
            "CAPWAP: tunnels control (UDP 5246, encrypted) and data (UDP 5247) between AP and WLC.",
          ] },
          { h: "AP modes" },
          { kv: [
            ["Local", "default — serves clients"],
            ["FlexConnect", "switches client data locally if WLC/WAN link is down (branch)"],
            ["Monitor", "no client service; IDS/location/rogue scan"],
            ["Sniffer", "captures and forwards 802.11 frames to an analyzer"],
            ["Rogue detector", "detects rogue APs on the wired side"],
            ["SE-Connect", "spectrum analysis"],
          ] },
          { p: "Roaming: client moves between APs in the same ESS/SSID. WLC anchors mobility so the client keeps its IP. WLC management connections: console, Telnet/SSH, HTTP/HTTPS GUI." },
        ],
      },
    ],
  },
  {
    num: 3,
    name: "IP Connectivity",
    weight: 25,
    blurb:
      "Routing logic, static routes, OSPFv2, IPv6 routing and first-hop redundancy. The heaviest-weighted domain.",
    sections: [
      {
        title: "Routing concepts & AD",
        blocks: [
          { p: "Routed protocol = carries user data (IP). Routing protocol = exchanges reachability info (OSPF, EIGRP, BGP). The router picks the route with the longest prefix match first; ties broken by lowest Administrative Distance, then lowest metric." },
          { h: "Administrative Distance (memorize)" },
          {
            table: {
              head: ["Source", "AD"],
              rows: [
                ["Connected", "0"],
                ["Static", "1"],
                ["EIGRP summary", "5"],
                ["eBGP", "20"],
                ["EIGRP (internal)", "90"],
                ["OSPF", "110"],
                ["IS-IS", "115"],
                ["RIP", "120"],
                ["EIGRP (external)", "170"],
                ["iBGP", "200"],
                ["Unreachable", "255"],
              ],
            },
          },
        ],
      },
      {
        title: "Static routing",
        blocks: [
          { code: "! specific static\nip route 10.2.2.0 255.255.255.0 192.168.1.2\n! default route\nip route 0.0.0.0 0.0.0.0 203.0.113.1\n! floating static (backup): higher AD than primary\nip route 10.2.2.0 255.255.255.0 192.168.9.2 200" },
          { ul: [
            "Next-hop IP, exit interface, or both. On multi-access links specify next-hop to avoid recursion issues.",
            "Summary/aggregate static covers many subnets with one route.",
            "Floating static = backup with a higher AD; only installs when the primary dies.",
          ] },
        ],
      },
      {
        title: "OSPFv2 deep dive",
        blocks: [
          { p: "Link-state IGP, AD 110, metric = cost = reference-bw / interface-bw (default ref 100 Mbps). Uses areas; all areas touch area 0 (backbone)." },
          { h: "Neighbor adjacency requirements" },
          { ul: [
            "Same area, matching hello/dead timers, matching subnet/mask on the link",
            "Matching authentication, matching MTU, matching area type, unique Router-IDs",
            "Not passive on the interface; OSPF multicast 224.0.0.5 / 224.0.0.6",
          ] },
          { h: "Adjacency states" },
          { p: "Down → Init → 2-Way (DR/BDR elected here) → ExStart → Exchange → Loading → Full." },
          { h: "DR/BDR election (broadcast/multi-access)" },
          { ul: [
            "Highest interface priority wins (default 1; 0 = never DR). Tie → highest Router-ID.",
            "Router-ID = manual 'router-id', else highest loopback IP, else highest active interface IP.",
            "Election is non-preemptive. DROthers form FULL only with DR/BDR.",
          ] },
          { h: "LSA types 1-5" },
          { kv: [
            ["Type 1 Router", "each router's links, flooded within area"],
            ["Type 2 Network", "generated by the DR for a multi-access segment"],
            ["Type 3 Summary", "inter-area routes, from ABR"],
            ["Type 4 ASBR-Summary", "how to reach the ASBR, from ABR"],
            ["Type 5 External", "redistributed external routes, from ASBR"],
          ] },
          { h: "Config (single & multi-area)" },
          { code: "router ospf 1\n router-id 1.1.1.1\n network 10.0.0.0 0.0.0.255 area 0\n network 10.0.1.0 0.0.0.255 area 1\n passive-interface g0/2\n! per-interface cost\ninterface g0/0\n ip ospf cost 10" },
        ],
      },
      {
        title: "IPv6 routing basics",
        blocks: [
          { code: "ipv6 unicast-routing\ninterface g0/0\n ipv6 address 2001:db8:0:1::1/64\n! static\nipv6 route 2001:db8:0:2::/64 2001:db8:0:12::2\n! default\nipv6 route ::/0 2001:db8::1\n! OSPFv3\nipv6 router ospf 1\ninterface g0/0\n ipv6 ospf 1 area 0" },
          { p: "IPv6 enables routing with 'ipv6 unicast-routing'. OSPFv3 is enabled per interface and uses link-local next hops." },
        ],
      },
      {
        title: "First Hop Redundancy (HSRP/VRRP/GLBP)",
        blocks: [
          { p: "FHRPs give hosts a redundant default gateway via a shared virtual IP/MAC." },
          {
            table: {
              head: ["Protocol", "Type", "Notes"],
              rows: [
                ["HSRP", "Cisco", "active/standby, vMAC 0000.0c07.acXX"],
                ["VRRP", "Open (RFC)", "master/backup, vMAC 0000.5e00.01XX"],
                ["GLBP", "Cisco", "active load-balances across multiple gateways (AVG/AVF)"],
              ],
            },
          },
          { h: "HSRP states & priority" },
          { ul: [
            "States: Initial → Learn → Listen → Speak → Standby → Active.",
            "Highest priority (default 100) becomes Active; tie → highest IP.",
            "Preempt is OFF by default — without it a recovered higher-priority router will NOT retake Active.",
            "Object tracking can decrement priority when an uplink fails.",
          ] },
          { code: "interface vlan 10\n ip address 10.0.10.2 255.255.255.0\n standby 1 ip 10.0.10.1\n standby 1 priority 110\n standby 1 preempt" },
        ],
      },
    ],
  },
  {
    num: 4,
    name: "IP Services",
    weight: 10,
    blurb:
      "NAT/PAT, DHCP, DNS, NTP, SNMP, Syslog, QoS and the file-transfer protocols used for IOS management.",
    sections: [
      {
        title: "NAT & PAT",
        blocks: [
          { kv: [
            ["Inside local", "private addr of inside host"],
            ["Inside global", "public addr the inside host appears as"],
            ["Outside global", "real public addr of the outside host"],
          ] },
          { code: "! Static NAT\nip nat inside source static 10.0.0.5 203.0.113.5\n! Dynamic NAT\nip nat pool POOL 203.0.113.10 203.0.113.20 netmask 255.255.255.0\naccess-list 1 permit 10.0.0.0 0.0.0.255\nip nat inside source list 1 pool POOL\n! PAT (overload) — many hosts, one IP\nip nat inside source list 1 interface g0/1 overload\ninterface g0/0\n ip nat inside\ninterface g0/1\n ip nat outside" },
          { code: "Verify: show ip nat translations | show ip nat statistics" },
          { p: "PAT (NAT overload) multiplexes many inside hosts onto one public IP using unique source ports." },
        ],
      },
      {
        title: "DHCP",
        blocks: [
          { p: "DORA: Discover (broadcast) → Offer → Request (broadcast) → Ack. Client then has IP, mask, gateway, DNS, lease." },
          { code: "ip dhcp excluded-address 10.0.10.1 10.0.10.10\nip dhcp pool LAN10\n network 10.0.10.0 255.255.255.0\n default-router 10.0.10.1\n dns-server 8.8.8.8\n lease 7" },
          { h: "Relay agent (helper)" },
          { p: "When the DHCP server is on another subnet, the router's interface forwards the broadcast as unicast:" },
          { code: "interface vlan 10\n ip helper-address 10.0.250.5" },
          { p: "DHCP snooping (security domain): trust the uplink/server port, drop rogue server replies on untrusted ports." },
        ],
      },
      {
        title: "DNS & record types",
        blocks: [
          {
            table: {
              head: ["Record", "Purpose"],
              rows: [
                ["A", "name → IPv4"],
                ["AAAA", "name → IPv6"],
                ["CNAME", "alias → canonical name"],
                ["MX", "mail exchanger (with priority)"],
                ["PTR", "IP → name (reverse)"],
                ["NS", "authoritative name server"],
              ],
            },
          },
          { code: "R(config)# ip name-server 8.8.8.8\nR(config)# ip domain-lookup\nR(config)# ip host SRV1 10.0.0.5" },
        ],
      },
      {
        title: "NTP",
        blocks: [
          { p: "Synchronizes clocks (UDP 123). Stratum = distance from the authoritative source: stratum 0 = reference clock, 1 = directly attached, higher = further; stratum 16 = unsynchronized." },
          { code: "R(config)# ntp server 192.0.2.10\n! make this device a source\nR(config)# ntp master 3\nVerify: show ntp status | show ntp associations" },
        ],
      },
      {
        title: "SNMP",
        blocks: [
          { ul: [
            "Manager polls agents; agents send unsolicited traps/informs. Data identified by OIDs in a MIB tree.",
            "v2c: community strings, no encryption. v3: adds authentication + encryption (authPriv) — preferred.",
            "Polls/responses UDP 161, traps UDP 162.",
          ] },
          { code: "snmp-server community READONLY ro\nsnmp-server host 10.0.0.9 version 2c READONLY\nsnmp-server enable traps" },
        ],
      },
      {
        title: "Syslog (severity 0-7)",
        blocks: [
          { p: "Lower number = more severe. Mnemonic: Every Awesome Cisco Engineer Will Need Ice-cream Daily." },
          {
            table: {
              head: ["#", "Level", "Meaning"],
              rows: [
                ["0", "Emergency", "system unusable"],
                ["1", "Alert", "act immediately"],
                ["2", "Critical", "critical condition"],
                ["3", "Error", "error condition"],
                ["4", "Warning", "warning condition"],
                ["5", "Notification", "normal but significant"],
                ["6", "Informational", "info message"],
                ["7", "Debugging", "debug output"],
              ],
            },
          },
          { code: "logging host 10.0.0.9\nlogging trap 5   ! send level 0-5 to server" },
        ],
      },
      {
        title: "QoS",
        blocks: [
          { ul: [
            "Marking: Layer 2 CoS (802.1p, 3 bits) and Layer 3 DSCP (6 bits in the ToS/Traffic-Class byte).",
            "Common DSCP: EF (46) voice, AF41 (34) interactive video, CS6 routing, default 0.",
            "Queuing: FIFO, WFQ, CBWFQ, and LLQ (priority queue for voice).",
            "Trust boundary: where the network begins trusting incoming markings (usually the access switch/IP phone).",
            "Tools: classification, marking, queuing, congestion avoidance (WRED), policing (drops) vs shaping (buffers).",
          ] },
        ],
      },
      {
        title: "TFTP / FTP for IOS",
        blocks: [
          { ul: [
            "TFTP (UDP 69): simple, no auth — common for IOS image / config copy.",
            "FTP (TCP 20/21): authenticated transfer.",
          ] },
          { code: "copy running-config tftp\ncopy tftp flash:\ncopy running-config startup-config" },
        ],
      },
    ],
  },
  {
    num: 5,
    name: "Security Fundamentals",
    weight: 15,
    blurb:
      "ACLs, port security, AAA, VPNs, wireless security, Layer-2 threat mitigation and device hardening.",
    sections: [
      {
        title: "Access Control Lists",
        blocks: [
          { kv: [
            ["Standard (1-99, 1300-1999)", "matches source IP only — place CLOSE to the DESTINATION"],
            ["Extended (100-199, 2000-2699)", "matches src+dst+protocol+port — place CLOSE to the SOURCE"],
          ] },
          { p: "Wildcard mask is the inverse of a subnet mask (0 = must match, 1 = ignore). 0.0.0.255 matches a /24. 'host x' = 0.0.0.0; 'any' = 0.0.0.0 255.255.255.255. Implicit 'deny any' ends every ACL." },
          { code: "! Extended named ACL: permit web, block the rest from a host\nip access-list extended WEB_ONLY\n permit tcp host 10.0.0.5 any eq 80\n permit tcp host 10.0.0.5 any eq 443\n deny ip any any log\ninterface g0/0\n ip access-group WEB_ONLY in" },
          { code: "! Standard, near destination\naccess-list 10 permit 192.168.1.0 0.0.0.255\ninterface g0/1\n ip access-group 10 out" },
        ],
      },
      {
        title: "Port security",
        blocks: [
          { p: "Limits which/how many MAC addresses can use an access port. Sticky learns MACs dynamically and saves them to running-config." },
          { code: "interface fa0/1\n switchport mode access\n switchport port-security\n switchport port-security maximum 2\n switchport port-security mac-address sticky\n switchport port-security violation restrict" },
          {
            table: {
              head: ["Violation mode", "Drops?", "Logs/SNMP?", "Err-disable?"],
              rows: [
                ["protect", "yes", "no", "no"],
                ["restrict", "yes", "yes", "no"],
                ["shutdown (default)", "yes", "yes", "yes"],
              ],
            },
          },
        ],
      },
      {
        title: "AAA (RADIUS vs TACACS+)",
        blocks: [
          { p: "Authentication = who you are; Authorization = what you can do; Accounting = what you did." },
          {
            table: {
              head: ["Feature", "RADIUS", "TACACS+"],
              rows: [
                ["Transport", "UDP 1812/1813", "TCP 49"],
                ["Encrypts", "password only", "entire payload"],
                ["AAA split", "combines authn+authz", "separates all three"],
                ["Typical use", "network access (802.1X)", "device admin (command authz)"],
                ["Origin", "open standard", "Cisco"],
              ],
            },
          },
        ],
      },
      {
        title: "VPNs",
        blocks: [
          { ul: [
            "Site-to-site IPsec: connects whole networks over the Internet; IKE phase 1 builds a secure mgmt tunnel, phase 2 builds the data SA.",
            "IPsec services: confidentiality (encryption), integrity (hashing), authentication, anti-replay. AH = integrity only; ESP = encryption + integrity.",
            "Remote-access: client (AnyConnect) to a head-end; SSL/TLS VPN runs over TCP 443, easy through firewalls.",
            "GRE tunnels can carry multicast/routing protocols (often protected by IPsec).",
          ] },
        ],
      },
      {
        title: "Wireless security",
        blocks: [
          { ul: [
            "WPA2 = AES-CCMP. WPA3 = stronger; SAE replaces the 4-way PSK handshake, protects against offline cracking.",
            "Personal (PSK): one shared passphrase. Enterprise (802.1X/EAP): per-user auth against a RADIUS server.",
            "Avoid WEP (broken) and TKIP (deprecated).",
          ] },
        ],
      },
      {
        title: "Layer-2 threats & mitigation",
        blocks: [
          {
            table: {
              head: ["Threat", "Mitigation"],
              rows: [
                ["MAC flooding (CAM overflow)", "port security"],
                ["Rogue DHCP server", "DHCP snooping"],
                ["ARP spoofing", "Dynamic ARP Inspection (DAI)"],
                ["IP spoofing", "IP Source Guard"],
                ["VLAN hopping (double-tag/DTP)", "set native VLAN unused, disable DTP, no unused trunks"],
                ["Broadcast/multicast storms", "storm-control"],
                ["STP manipulation", "BPDU Guard + Root Guard"],
              ],
            },
          },
          { code: "ip dhcp snooping\nip dhcp snooping vlan 10\ninterface g0/1\n ip dhcp snooping trust\nip arp inspection vlan 10" },
        ],
      },
      {
        title: "Device hardening",
        blocks: [
          { ul: [
            "Use SSH (encrypted) not Telnet (cleartext). Requires hostname, domain-name, RSA key ≥1024, local user.",
            "'enable secret' (MD5/scrypt) beats 'enable password' (weak/cleartext).",
            "'service password-encryption' obscures cleartext passwords in config.",
            "Login banners (banner motd) for legal notice. Disable unused services.",
          ] },
          { code: "hostname R1\nip domain-name lab.local\ncrypto key generate rsa modulus 2048\nusername admin secret S3cret!\nenable secret S3cret!\nservice password-encryption\nline vty 0 4\n transport input ssh\n login local\nip ssh version 2\nbanner motd #Authorized access only#" },
        ],
      },
    ],
  },
  {
    num: 6,
    name: "Automation & Programmability",
    weight: 10,
    blurb:
      "SDN planes, controller-based fabrics, REST APIs, config-management tooling, model-driven programmability and the v1.1 AI/ML additions.",
    sections: [
      {
        title: "SDN & network planes",
        blocks: [
          { kv: [
            ["Data (forwarding) plane", "moves packets/frames (ASIC) based on tables"],
            ["Control plane", "builds the tables (routing, STP, ARP)"],
            ["Management plane", "admin access: SSH, SNMP, syslog, APIs"],
          ] },
          { p: "SDN centralizes the control plane into a controller that programs devices via a southbound interface (e.g. OpenFlow, NETCONF) and exposes a northbound API (REST) to apps." },
        ],
      },
      {
        title: "Controller-based networking (SD-WAN / SD-Access)",
        blocks: [
          { ul: [
            "Cisco DNA Center / Catalyst Center = controller for campus SD-Access (intent-based, policy via groups).",
            "SD-Access fabric: underlay (physical IP) + overlay (VXLAN), LISP control plane, group-based policy.",
            "SD-WAN (Viptela): vManage (mgmt), vSmart (control), vBond (orchestration), vEdge/cEdge (data).",
            "Benefits over traditional/box-by-box: central policy, automation, consistency, telemetry.",
          ] },
        ],
      },
      {
        title: "REST APIs",
        blocks: [
          {
            table: {
              head: ["Verb", "Action (CRUD)"],
              rows: [
                ["GET", "read"],
                ["POST", "create"],
                ["PUT/PATCH", "update/replace/modify"],
                ["DELETE", "delete"],
              ],
            },
          },
          { h: "HTTP status code classes" },
          { kv: [
            ["2xx", "success (200 OK, 201 Created)"],
            ["3xx", "redirect"],
            ["4xx", "client error (401 unauth, 403 forbidden, 404 not found)"],
            ["5xx", "server error (500)"],
          ] },
          { p: "REST is stateless over HTTPS; payloads are usually JSON (sometimes XML). Auth via tokens/keys/Basic." },
        ],
      },
      {
        title: "Config management: Ansible / Terraform",
        blocks: [
          {
            table: {
              head: ["Tool", "Agent", "Language", "Model"],
              rows: [
                ["Ansible", "agentless (SSH)", "YAML playbooks", "procedural-ish, push"],
                ["Puppet", "agent", "Puppet DSL (Ruby)", "declarative, pull"],
                ["Chef", "agent", "Ruby recipes", "procedural, pull"],
                ["Terraform", "agentless", "HCL", "declarative IaC, push"],
              ],
            },
          },
          { ul: [
            "Ansible: agentless over SSH; inventory lists hosts; modules do the work; playbooks are idempotent.",
            "Terraform: declarative Infrastructure-as-Code; you describe desired state, it computes the plan to reach it.",
          ] },
          { code: "# ansible playbook (concept)\n- hosts: switches\n  tasks:\n    - name: set interface description\n      ios_config:\n        lines:\n          - description UPLINK\n        parents: interface Gi0/1" },
        ],
      },
      {
        title: "Model-driven: YANG / NETCONF / RESTCONF",
        blocks: [
          { kv: [
            ["YANG", "data model defining structure of config/state"],
            ["NETCONF", "protocol over SSH (830), XML payloads, transactions"],
            ["RESTCONF", "REST-style over HTTPS, JSON or XML payloads"],
          ] },
          { code: "<!-- NETCONF get-config (concept) -->\n<get-config>\n  <source><running/></source>\n</get-config>" },
        ],
      },
      {
        title: "Data formats (JSON / XML)",
        blocks: [
          { p: "JSON: key/value, arrays, objects — lightweight, common in REST." },
          { code: '{\n  "interface": {\n    "name": "GigabitEthernet0/1",\n    "enabled": true,\n    "ipv4": { "address": "10.0.0.1", "mask": "255.255.255.0" }\n  }\n}' },
          { code: "<interface>\n  <name>GigabitEthernet0/1</name>\n  <enabled>true</enabled>\n</interface>" },
          { p: "JSON data types: string, number, boolean, null, array [], object {}. Whitespace is insignificant." },
        ],
      },
      {
        title: "AI/ML in networking (v1.1)",
        blocks: [
          { ul: [
            "AIOps applies machine learning to telemetry for predictive analytics and anomaly detection (baseline normal, flag deviations).",
            "Intent-based networking (IBN): you express intent (policy/outcome); the controller translates, activates and continuously assures it.",
            "Use cases: predictive failure/capacity, automated root-cause, dynamic optimization, security threat detection.",
            "Generative AI assistants help summarize config, explain issues, and draft automation — always human-reviewed.",
          ] },
        ],
      },
    ],
  },
];
