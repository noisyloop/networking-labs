/* ===========================================================================
 * DATA :: QUESTIONS
 * ========================================================================= */
export const QUESTIONS = [
  /* ===================== DOMAIN 1 :: 20 ===================== */
  {
    id: "q1",
    domain: 1,
    type: "single",
    q: "At which OSI layer does a router primarily operate, and what PDU does it process?",
    options: [
      "Layer 2, frames",
      "Layer 3, packets",
      "Layer 4, segments",
      "Layer 1, bits",
    ],
    answer: 1,
    explain:
      "Routers make forwarding decisions on Layer 3 (Network) using IP addresses; the Layer-3 PDU is the packet.",
  },
  {
    id: "q2",
    domain: 1,
    type: "single",
    q: "Which transport-layer protocol should carry a real-time VoIP call?",
    options: ["TCP, for guaranteed delivery", "UDP, for low latency", "ICMP", "ARP"],
    answer: 1,
    explain:
      "Voice favors low latency over retransmission. UDP is connectionless with minimal overhead; late retransmitted audio is useless, so UDP is preferred.",
  },
  {
    id: "q3",
    domain: 1,
    type: "single",
    q: "How many usable host addresses does a /29 subnet provide?",
    options: ["8", "6", "14", "30"],
    answer: 1,
    explain:
      "/29 leaves 3 host bits → 2^3 = 8 addresses, minus network and broadcast = 6 usable hosts.",
  },
  {
    id: "q4",
    domain: 1,
    type: "single",
    q: "Which address range is reserved for APIPA when a host fails to obtain a DHCP lease?",
    options: [
      "10.0.0.0/8",
      "172.16.0.0/12",
      "169.254.0.0/16",
      "192.168.0.0/16",
    ],
    answer: 2,
    explain:
      "APIPA self-assigns from 169.254.0.0/16 when DHCP is unavailable, enabling local link communication only.",
  },
  {
    id: "q5",
    domain: 1,
    type: "single",
    q: "What is the network address of host 172.16.45.130/26?",
    options: ["172.16.45.0", "172.16.45.64", "172.16.45.128", "172.16.45.192"],
    answer: 2,
    explain:
      "/26 → block size 64. Subnets: .0, .64, .128, .192. 130 falls in the .128 block, so the network is 172.16.45.128.",
  },
  {
    id: "q6",
    domain: 1,
    type: "single",
    q: "During EUI-64 generation, what is inserted into the middle of the 48-bit MAC address?",
    options: ["FFFF", "FFFE", "FE80", "0000"],
    answer: 1,
    explain:
      "EUI-64 splits the MAC and inserts FFFE in the middle to expand 48 bits to 64, then flips the U/L bit.",
  },
  {
    id: "q7",
    domain: 1,
    type: "single",
    q: "Which IPv6 address type always begins with FE80 and is never routed off the link?",
    options: ["Global unicast", "Unique local", "Link-local", "Multicast"],
    answer: 2,
    explain:
      "Link-local addresses (FE80::/10) are auto-configured on every IPv6 interface and are not forwarded by routers.",
  },
  {
    id: "q8",
    domain: 1,
    type: "single",
    q: "Which cable connects a PC's NIC to a switch access port?",
    options: ["Crossover", "Rollover", "Straight-through", "Coaxial"],
    answer: 2,
    explain:
      "Unlike devices (PC↔switch) use a straight-through cable. Crossover is for like devices; rollover is for console access.",
  },
  {
    id: "q9",
    domain: 1,
    type: "single",
    q: "Which field in an Ethernet II frame provides error detection?",
    options: ["Preamble", "Type", "FCS", "SFD"],
    answer: 2,
    explain:
      "The Frame Check Sequence (FCS) carries a CRC the receiver recomputes to detect corruption.",
  },
  {
    id: "q10",
    domain: 1,
    type: "single",
    q: "In CSMA/CD, what does a station do immediately after detecting a collision?",
    options: [
      "Increase transmission speed",
      "Send a jam signal then back off a random time",
      "Switch to full duplex",
      "Drop the frame silently",
    ],
    answer: 1,
    explain:
      "On collision the station sends a 32-bit jam signal so all hosts notice, then uses the random binary exponential back-off before retrying.",
  },
  {
    id: "q11",
    domain: 1,
    type: "single",
    q: "Which 2.4 GHz channels are non-overlapping in North America?",
    options: ["1, 5, 9", "1, 6, 11", "2, 7, 12", "1, 4, 8"],
    answer: 1,
    explain:
      "Channels 1, 6, and 11 are the standard non-overlapping 20 MHz channels in the 2.4 GHz band.",
  },
  {
    id: "q12",
    domain: 1,
    type: "single",
    q: "What distinguishes a container from a virtual machine?",
    options: [
      "A container includes its own full guest OS",
      "A container shares the host OS kernel",
      "A VM is always smaller than a container",
      "A container requires a Type 1 hypervisor",
    ],
    answer: 1,
    explain:
      "Containers share the host kernel and package only the app and its dependencies, making them lighter than VMs, which each run a full guest OS.",
  },
  {
    id: "q13",
    domain: 1,
    type: "single",
    q: "Which cloud service model delivers a complete, ready-to-use application over the Internet?",
    options: ["IaaS", "PaaS", "SaaS", "NFV"],
    answer: 2,
    explain:
      "SaaS provides finished software (e.g. webmail) to end users; IaaS provides infrastructure and PaaS provides a development platform.",
  },
  {
    id: "q14",
    domain: 1,
    type: "single",
    q: "What is the default subnet mask of a Class B address in dotted decimal?",
    options: ["255.0.0.0", "255.255.0.0", "255.255.255.0", "255.255.255.128"],
    answer: 1,
    explain:
      "Class B (128–191 in the first octet) uses a default /16 = 255.255.0.0.",
  },
  {
    id: "q15",
    domain: 1,
    type: "multi",
    q: "Which two protocols operate at the OSI Transport layer? (Choose two.)",
    options: ["IP", "TCP", "UDP", "Ethernet"],
    answer: [1, 2],
    explain:
      "TCP and UDP are Layer-4 transport protocols. IP is Layer 3 and Ethernet is Layer 2.",
  },
  {
    id: "q16",
    domain: 1,
    type: "single",
    q: "Replacing ARP in IPv6, which protocol resolves a neighbor's link-layer address?",
    options: ["RARP", "NDP (Neighbor Discovery)", "ICMPv4", "DHCPv6"],
    answer: 1,
    explain:
      "NDP uses ICMPv6 Neighbor Solicitation/Advertisement messages to resolve addresses, replacing IPv4 ARP.",
  },
  {
    id: "q17",
    domain: 1,
    type: "single",
    q: "Which statement about the TCP three-way handshake is correct?",
    options: [
      "It is SYN, ACK, FIN",
      "It is SYN, SYN-ACK, ACK",
      "It uses four packets",
      "It carries the first data payload in the SYN",
    ],
    answer: 1,
    explain:
      "The handshake is SYN → SYN-ACK → ACK. Teardown is the separate four-way FIN exchange; data flows after the handshake.",
  },
  {
    id: "q18",
    domain: 1,
    type: "single",
    q: "How many subnets and hosts-per-subnet result from applying /28 to a Class C network?",
    options: [
      "16 subnets, 14 hosts each",
      "8 subnets, 30 hosts each",
      "14 subnets, 16 hosts each",
      "4 subnets, 62 hosts each",
    ],
    answer: 0,
    explain:
      "Going from /24 to /28 borrows 4 bits → 2^4 = 16 subnets, leaving 4 host bits → 2^4 − 2 = 14 hosts each.",
  },
  {
    id: "q19",
    domain: 1,
    type: "single",
    q: "Which IPv6 transition technique runs IPv4 and IPv6 simultaneously on the same interfaces?",
    options: ["NAT64", "Dual stack", "6to4 tunneling", "Teredo"],
    answer: 1,
    explain:
      "Dual stack assigns both IPv4 and IPv6 to interfaces so the device can communicate natively over either protocol.",
  },
  {
    id: "q20",
    domain: 1,
    type: "match",
    q: "Match each OSI layer to its PDU.",
    left: ["Transport", "Network", "Data Link", "Physical"],
    right: ["Bits", "Frame", "Packet", "Segment"],
    answer: [3, 2, 1, 0],
    explain:
      "Transport = Segment, Network = Packet, Data Link = Frame, Physical = Bits.",
  },

  /* ===================== DOMAIN 2 :: 20 ===================== */
  {
    id: "q21",
    domain: 2,
    type: "single",
    q: "What is the primary purpose of a VLAN?",
    options: [
      "To extend a single collision domain",
      "To segment a switch into separate Layer-2 broadcast domains",
      "To route between subnets",
      "To encrypt frames",
    ],
    answer: 1,
    explain:
      "A VLAN creates a logical broadcast domain; devices in different VLANs require a Layer-3 device to communicate.",
  },
  {
    id: "q22",
    domain: 2,
    type: "single",
    q: "How many bytes does an 802.1Q tag add to an Ethernet frame?",
    options: ["2", "4", "8", "12"],
    answer: 1,
    explain:
      "The 802.1Q tag is 4 bytes (TPID 2 bytes + TCI 2 bytes containing PCP, DEI and the 12-bit VLAN ID).",
  },
  {
    id: "q23",
    domain: 2,
    type: "single",
    q: "On an 802.1Q trunk, how are frames in the native VLAN transmitted?",
    options: ["Double-tagged", "Tagged with VLAN 1", "Untagged", "Dropped"],
    answer: 2,
    explain:
      "The native VLAN is sent untagged across the trunk; all other VLANs are tagged.",
  },
  {
    id: "q24",
    domain: 2,
    type: "single",
    q: "Which command forces an interface to be a trunk regardless of DTP negotiation?",
    options: [
      "switchport mode dynamic auto",
      "switchport mode access",
      "switchport mode trunk",
      "switchport nonegotiate only",
    ],
    answer: 2,
    explain:
      "'switchport mode trunk' hard-sets trunking. Best practice adds 'switchport nonegotiate' to disable DTP.",
  },
  {
    id: "q25",
    domain: 2,
    type: "single",
    q: "In STP, how is the root bridge elected?",
    options: [
      "Highest IP address",
      "Lowest Bridge ID (priority + MAC)",
      "Highest MAC address",
      "Fastest uplink",
    ],
    answer: 1,
    explain:
      "The switch with the lowest Bridge ID (priority plus extended system ID plus MAC) becomes the root bridge.",
  },
  {
    id: "q26",
    domain: 2,
    type: "single",
    q: "Which RSTP port role is a backup path to the root that is currently discarding?",
    options: ["Root port", "Designated port", "Alternate port", "Edge port"],
    answer: 2,
    explain:
      "An alternate port offers an alternative path to the root and is in the discarding state until the root port fails.",
  },
  {
    id: "q27",
    domain: 2,
    type: "single",
    q: "What is the default STP path cost of a 1 Gbps link?",
    options: ["1", "4", "19", "100"],
    answer: 1,
    explain:
      "Using the standard short cost values: 10 Mbps = 100, 100 Mbps = 19, 1 Gbps = 4, 10 Gbps = 2.",
  },
  {
    id: "q28",
    domain: 2,
    type: "single",
    q: "Which feature err-disables a PortFast-enabled access port if it receives a BPDU?",
    options: ["Root Guard", "BPDU Guard", "Loop Guard", "UDLD"],
    answer: 1,
    explain:
      "BPDU Guard shuts (err-disables) a PortFast port that receives a BPDU, protecting against an unauthorized switch.",
  },
  {
    id: "q29",
    domain: 2,
    type: "single",
    q: "Which two LACP mode combinations will successfully form an EtherChannel?",
    options: [
      "passive / passive",
      "active / passive",
      "auto / auto",
      "on / active",
    ],
    answer: 1,
    explain:
      "LACP forms with active/active or active/passive. Passive/passive never initiates; on/active mixes static with LACP and fails.",
  },
  {
    id: "q30",
    domain: 2,
    type: "single",
    q: "Why does STP not block links that are bundled in an EtherChannel?",
    options: [
      "EtherChannel disables STP globally",
      "STP sees the bundle as a single logical link",
      "EtherChannel uses Layer 3 only",
      "BPDUs are filtered on the bundle",
    ],
    answer: 1,
    explain:
      "EtherChannel presents the member links as one logical port to STP, so there is no redundant path for STP to block.",
  },
  {
    id: "q31",
    domain: 2,
    type: "single",
    q: "Which protocol tunnels traffic between a lightweight AP and a WLC?",
    options: ["GRE", "CAPWAP", "IPsec", "LWAPP only"],
    answer: 1,
    explain:
      "CAPWAP tunnels control (UDP 5246) and data (UDP 5247) between lightweight APs and the WLC.",
  },
  {
    id: "q32",
    domain: 2,
    type: "single",
    q: "Which AP mode lets a branch AP keep switching client traffic locally if the WAN link to the WLC fails?",
    options: ["Local", "Monitor", "FlexConnect", "Sniffer"],
    answer: 2,
    explain:
      "FlexConnect allows the AP to switch client data locally and continue operating when the WLC/WAN connection is down.",
  },
  {
    id: "q33",
    domain: 2,
    type: "single",
    q: "What does the command 'switchport access vlan 10' accomplish?",
    options: [
      "Creates VLAN 10 as a trunk",
      "Assigns the access port to VLAN 10",
      "Sets the native VLAN to 10",
      "Prunes VLAN 10",
    ],
    answer: 1,
    explain:
      "It places the access port into VLAN 10. (If VLAN 10 doesn't exist it is created automatically.)",
  },
  {
    id: "q34",
    domain: 2,
    type: "single",
    q: "An IP phone with a PC behind it connects to a switch port. Which command supports voice traffic in a separate VLAN?",
    options: [
      "switchport trunk allowed vlan voice",
      "switchport voice vlan 110",
      "switchport mode trunk",
      "voice vlan dot1p",
    ],
    answer: 1,
    explain:
      "'switchport voice vlan 110' tags voice traffic into VLAN 110 while data stays in the access VLAN.",
  },
  {
    id: "q35",
    domain: 2,
    type: "multi",
    q: "Which two conditions cause EtherChannel member ports to be suspended? (Choose two.)",
    options: [
      "Mismatched duplex between members",
      "Identical speed on all members",
      "Different allowed VLAN lists between ends",
      "Same channel-group number",
    ],
    answer: [0, 2],
    explain:
      "Members must match speed, duplex and VLAN configuration. Mismatched duplex or inconsistent allowed VLANs suspend the ports.",
  },
  {
    id: "q36",
    domain: 2,
    type: "single",
    q: "Which transition is unique to RSTP compared with legacy 802.1D?",
    options: [
      "It adds a Listening state",
      "It achieves convergence faster using proposal/agreement",
      "It removes the root bridge concept",
      "It blocks all alternate ports permanently",
    ],
    answer: 1,
    explain:
      "RSTP (802.1w) converges in seconds using a proposal/agreement handshake instead of timer-based Listening/Learning delays.",
  },
  {
    id: "q37",
    domain: 2,
    type: "single",
    q: "What is the result of a native VLAN mismatch on a trunk?",
    options: [
      "Trunk speed doubles",
      "Traffic in the native VLANs can leak between them (security/connectivity issue)",
      "The trunk converts to access mode",
      "All VLANs stop forwarding",
    ],
    answer: 1,
    explain:
      "Mismatched native VLANs cause untagged traffic to land in the wrong VLAN, creating a connectivity and VLAN-hopping risk; CDP logs the mismatch.",
  },
  {
    id: "q38",
    domain: 2,
    type: "single",
    q: "Which command set makes a switch the root bridge for VLAN 1 with the highest possible preference?",
    options: [
      "spanning-tree vlan 1 priority 61440",
      "spanning-tree vlan 1 priority 4096",
      "spanning-tree vlan 1 cost 1",
      "spanning-tree portfast default",
    ],
    answer: 1,
    explain:
      "Lower priority wins. 4096 is much lower than the 32768 default, so this switch becomes root. Priorities must be multiples of 4096.",
  },
  {
    id: "q39",
    domain: 2,
    type: "single",
    q: "On which device/interface is router-on-a-stick configured?",
    options: [
      "A single router physical interface split into 802.1Q subinterfaces",
      "Each switch access port",
      "The WLC management interface",
      "An EtherChannel port-channel",
    ],
    answer: 0,
    explain:
      "Router-on-a-stick uses one router interface divided into subinterfaces, each with 'encapsulation dot1Q <vlan>', trunked to the switch.",
  },
  {
    id: "q40",
    domain: 2,
    type: "match",
    q: "Match each RSTP port role to its description.",
    left: ["Root port", "Designated port", "Alternate port"],
    right: [
      "Forwarding port elected per segment",
      "Best path to the root bridge",
      "Discarding backup path to the root",
    ],
    answer: [1, 0, 2],
    explain:
      "Root port = best path to root; Designated port = forwarding port per segment; Alternate port = discarding backup to the root.",
  },

  /* ===================== DOMAIN 3 :: 25 ===================== */
  {
    id: "q41",
    domain: 3,
    type: "single",
    q: "What administrative distance does a standard static route have by default?",
    options: ["0", "1", "90", "110"],
    answer: 1,
    explain:
      "A static route has AD 1 by default (connected is 0). Lower AD is more trusted.",
  },
  {
    id: "q42",
    domain: 3,
    type: "single",
    q: "Which administrative distance does OSPF use?",
    options: ["90", "100", "110", "120"],
    answer: 2,
    explain:
      "OSPF's AD is 110. EIGRP internal is 90, RIP is 120.",
  },
  {
    id: "q43",
    domain: 3,
    type: "single",
    q: "A router has routes to 10.1.1.0/24 via OSPF and a /32 to 10.1.1.5 via static. Which is used for traffic to 10.1.1.5?",
    options: [
      "OSPF, lower AD",
      "The /32 static, longest prefix match",
      "Both, load-balanced",
      "Neither, they conflict",
    ],
    answer: 1,
    explain:
      "Longest prefix match is evaluated before AD. The more specific /32 wins for 10.1.1.5.",
  },
  {
    id: "q44",
    domain: 3,
    type: "single",
    q: "Which static route is a 'floating' backup?",
    options: [
      "ip route 0.0.0.0 0.0.0.0 g0/0",
      "ip route 10.0.0.0 255.0.0.0 192.168.1.2",
      "ip route 10.0.0.0 255.0.0.0 192.168.1.6 200",
      "ip route 10.0.0.0 255.255.255.0 null0",
    ],
    answer: 2,
    explain:
      "Appending an AD higher than the primary (here 200) makes it a floating static that installs only when the primary fails.",
  },
  {
    id: "q45",
    domain: 3,
    type: "single",
    q: "How is OSPF cost calculated by default?",
    options: [
      "Hop count",
      "Reference bandwidth (100 Mbps) divided by interface bandwidth",
      "Delay plus bandwidth",
      "Bandwidth times reliability",
    ],
    answer: 1,
    explain:
      "Default OSPF cost = reference bandwidth (100 Mbps) / interface bandwidth, with a minimum of 1.",
  },
  {
    id: "q46",
    domain: 3,
    type: "single",
    q: "In which OSPF neighbor state is the DR/BDR elected on a multi-access network?",
    options: ["Init", "2-Way", "ExStart", "Full"],
    answer: 1,
    explain:
      "DR/BDR election occurs in the 2-Way state once routers see themselves in each other's hello packets.",
  },
  {
    id: "q47",
    domain: 3,
    type: "single",
    q: "How is the OSPF Router-ID chosen if none is configured and no loopback exists?",
    options: [
      "Lowest interface IP",
      "Highest active interface IP",
      "The first configured interface",
      "Random value",
    ],
    answer: 1,
    explain:
      "Order: manual 'router-id', then highest loopback IP, then highest active physical interface IP.",
  },
  {
    id: "q48",
    domain: 3,
    type: "single",
    q: "Which OSPF LSA type is generated by an ABR to advertise inter-area routes?",
    options: ["Type 1", "Type 2", "Type 3", "Type 5"],
    answer: 2,
    explain:
      "Type 3 Summary LSAs are generated by the ABR to describe routes from one area into another.",
  },
  {
    id: "q49",
    domain: 3,
    type: "single",
    q: "Two OSPF routers are stuck in EXSTART/EXCHANGE. What is a common cause?",
    options: [
      "Different process IDs",
      "MTU mismatch on the link",
      "Different hostnames",
      "Same Router-ID priority",
    ],
    answer: 1,
    explain:
      "An interface MTU mismatch commonly traps adjacencies in EXSTART/EXCHANGE. OSPF process IDs are locally significant and need not match.",
  },
  {
    id: "q50",
    domain: 3,
    type: "single",
    q: "Which requirement must match for two routers to form an OSPF adjacency?",
    options: [
      "OSPF process ID",
      "Hello and dead timers",
      "Router hostnames",
      "Loopback addresses",
    ],
    answer: 1,
    explain:
      "Hello/dead timers, area ID, subnet/mask, authentication and MTU must match. The process ID is locally significant.",
  },
  {
    id: "q51",
    domain: 3,
    type: "single",
    q: "Which command advertises 10.1.1.0/24 into OSPF area 0 with the correct wildcard mask?",
    options: [
      "network 10.1.1.0 255.255.255.0 area 0",
      "network 10.1.1.0 0.0.0.255 area 0",
      "network 10.1.1.0 0.0.255.255 area 0",
      "network 10.1.1.0 area 0",
    ],
    answer: 1,
    explain:
      "OSPF network statements use a wildcard (inverse) mask. /24 → 0.0.0.255.",
  },
  {
    id: "q52",
    domain: 3,
    type: "single",
    q: "Which FHRP is an open standard?",
    options: ["HSRP", "GLBP", "VRRP", "PAgP"],
    answer: 2,
    explain:
      "VRRP is the IETF open standard. HSRP and GLBP are Cisco proprietary; PAgP is an EtherChannel protocol, not an FHRP.",
  },
  {
    id: "q53",
    domain: 3,
    type: "single",
    q: "By default, what must be enabled for a recovered higher-priority HSRP router to retake the active role?",
    options: ["Tracking", "Preempt", "Authentication", "Timers"],
    answer: 1,
    explain:
      "HSRP preempt is disabled by default; without it the higher-priority router stays standby after recovery.",
  },
  {
    id: "q54",
    domain: 3,
    type: "single",
    q: "Which HSRP router becomes active when priorities are equal?",
    options: [
      "The one with the lowest IP",
      "The one with the highest IP",
      "The one with the lowest MAC",
      "Neither — election fails",
    ],
    answer: 1,
    explain:
      "With equal priority, the router with the highest interface IP address wins the active role.",
  },
  {
    id: "q55",
    domain: 3,
    type: "single",
    q: "What does 'ipv6 unicast-routing' enable on a router?",
    options: [
      "IPv6 addressing on interfaces",
      "Forwarding/routing of IPv6 packets",
      "OSPFv3 only",
      "Stateless DHCPv6",
    ],
    answer: 1,
    explain:
      "It enables the router to forward IPv6 traffic. Without it the router can have IPv6 addresses but won't route between them.",
  },
  {
    id: "q56",
    domain: 3,
    type: "single",
    q: "Which next-hop type does OSPFv3 use to install routes?",
    options: [
      "Global unicast of the neighbor",
      "Link-local address of the neighbor",
      "The DR's loopback",
      "Anycast address",
    ],
    answer: 1,
    explain:
      "OSPFv3 uses the neighbor's link-local address as the next hop for installed routes.",
  },
  {
    id: "q57",
    domain: 3,
    type: "single",
    q: "Which route would a router prefer: eBGP (AD 20) or OSPF (AD 110) for the same prefix/length?",
    options: ["OSPF", "eBGP", "Both", "The one with lower metric"],
    answer: 1,
    explain:
      "With identical prefix length, the lower administrative distance wins. eBGP's AD 20 beats OSPF's 110.",
  },
  {
    id: "q58",
    domain: 3,
    type: "single",
    q: "What is the AD of a directly connected interface?",
    options: ["0", "1", "5", "110"],
    answer: 0,
    explain:
      "Connected routes have AD 0 — the most trusted source.",
  },
  {
    id: "q59",
    domain: 3,
    type: "single",
    q: "A default route is written as which of the following?",
    options: [
      "ip route 0.0.0.0 255.255.255.255 <nh>",
      "ip route 0.0.0.0 0.0.0.0 <nh>",
      "ip route default <nh>",
      "ip default-network only",
    ],
    answer: 1,
    explain:
      "The default route uses all-zeros network and mask: ip route 0.0.0.0 0.0.0.0 <next-hop>.",
  },
  {
    id: "q60",
    domain: 3,
    type: "single",
    q: "On a broadcast OSPF segment, which routers do DROthers form a FULL adjacency with?",
    options: [
      "All other routers",
      "Only the DR and BDR",
      "Only the DR",
      "None",
    ],
    answer: 1,
    explain:
      "DROthers form FULL adjacencies only with the DR and BDR; with each other they remain in the 2-Way state.",
  },
  {
    id: "q61",
    domain: 3,
    type: "single",
    q: "Which OSPF interface priority value prevents a router from ever becoming the DR?",
    options: ["255", "1", "0", "128"],
    answer: 2,
    explain:
      "An OSPF interface priority of 0 makes the router ineligible for DR/BDR election on that segment.",
  },
  {
    id: "q62",
    domain: 3,
    type: "multi",
    q: "Which two are valid OSPF LSA types and their origins? (Choose two.)",
    options: [
      "Type 1 Router LSA — every router, within an area",
      "Type 5 External LSA — generated by the ABR",
      "Type 2 Network LSA — generated by the DR",
      "Type 3 Summary LSA — generated by the ASBR",
    ],
    answer: [0, 2],
    explain:
      "Type 1 is the router LSA flooded within an area; Type 2 is created by the DR. Type 5 comes from the ASBR and Type 3 from the ABR (the reverse of the wrong options).",
  },
  {
    id: "q63",
    domain: 3,
    type: "single",
    q: "What does the routing table code 'O IA' indicate?",
    options: [
      "OSPF intra-area route",
      "OSPF inter-area route",
      "OSPF external type 1",
      "An invalid route",
    ],
    answer: 1,
    explain:
      "'O IA' marks an OSPF inter-area route learned via a Type-3 summary LSA from an ABR.",
  },
  {
    id: "q64",
    domain: 3,
    type: "single",
    q: "Which command makes an interface participate in OSPF routing while not sending hellos out of it?",
    options: [
      "passive-interface",
      "no ip ospf",
      "shutdown",
      "ip ospf network point-to-point",
    ],
    answer: 0,
    explain:
      "'passive-interface' still advertises the subnet but stops OSPF hellos, preventing adjacencies on that interface (e.g. LAN edges).",
  },
  {
    id: "q65",
    domain: 3,
    type: "match",
    q: "Match each routing source to its administrative distance.",
    left: ["Connected", "Static", "OSPF", "RIP"],
    right: ["120", "0", "110", "1"],
    answer: [1, 3, 2, 0],
    explain:
      "Connected = 0, Static = 1, OSPF = 110, RIP = 120.",
  },

  /* ===================== DOMAIN 4 :: 10 ===================== */
  {
    id: "q66",
    domain: 4,
    type: "single",
    q: "Which NAT variation lets many inside hosts share one public IP using unique source ports?",
    options: ["Static NAT", "Dynamic NAT", "PAT (overload)", "Twice NAT"],
    answer: 2,
    explain:
      "PAT (NAT overload) multiplexes many private hosts onto one public IP by tracking unique source port numbers.",
  },
  {
    id: "q67",
    domain: 4,
    type: "single",
    q: "What is the correct order of the DHCP DORA process?",
    options: [
      "Discover, Offer, Request, Acknowledge",
      "Offer, Discover, Request, Ack",
      "Request, Offer, Discover, Ack",
      "Discover, Request, Offer, Ack",
    ],
    answer: 0,
    explain:
      "DORA = Discover (client broadcast) → Offer (server) → Request (client broadcast) → Acknowledge (server).",
  },
  {
    id: "q68",
    domain: 4,
    type: "single",
    q: "Which command lets a router forward DHCP requests to a server on another subnet?",
    options: [
      "ip dhcp relay",
      "ip helper-address <server>",
      "ip forward-protocol dhcp",
      "service dhcp remote",
    ],
    answer: 1,
    explain:
      "'ip helper-address' on the client-facing SVI/interface converts the DHCP broadcast to a unicast toward the server.",
  },
  {
    id: "q69",
    domain: 4,
    type: "single",
    q: "Which DNS record maps a hostname to an IPv6 address?",
    options: ["A", "AAAA", "CNAME", "MX"],
    answer: 1,
    explain:
      "AAAA records resolve a name to an IPv6 address; A records are for IPv4.",
  },
  {
    id: "q70",
    domain: 4,
    type: "single",
    q: "An NTP device reporting stratum 16 indicates what?",
    options: [
      "It is the most accurate source",
      "It is unsynchronized",
      "It is a stratum-1 backup",
      "It is in client mode only",
    ],
    answer: 1,
    explain:
      "Stratum 16 means the clock is unsynchronized; lower stratum numbers are closer to the reference clock (stratum 0).",
  },
  {
    id: "q71",
    domain: 4,
    type: "single",
    q: "Which SNMP version provides authentication and encryption?",
    options: ["v1", "v2c", "v3", "v2"],
    answer: 2,
    explain:
      "SNMPv3 adds message integrity, authentication and encryption (authPriv). v1/v2c rely on cleartext community strings.",
  },
  {
    id: "q72",
    domain: 4,
    type: "single",
    q: "On the syslog severity scale, which level is the most severe?",
    options: ["0 Emergency", "7 Debugging", "4 Warning", "5 Notification"],
    answer: 0,
    explain:
      "Lower numbers are more severe: 0 = Emergency (system unusable), 7 = Debugging (least severe).",
  },
  {
    id: "q73",
    domain: 4,
    type: "single",
    q: "Which DSCP marking is typically used for voice traffic?",
    options: ["EF (46)", "AF11 (10)", "CS1 (8)", "Default (0)"],
    answer: 0,
    explain:
      "Expedited Forwarding (EF, DSCP 46) is the standard marking for latency-sensitive voice, usually served by a low-latency priority queue.",
  },
  {
    id: "q74",
    domain: 4,
    type: "multi",
    q: "Which two are configured in a basic IOS DHCP pool? (Choose two.)",
    options: [
      "network statement",
      "default-router",
      "spanning-tree priority",
      "channel-group",
    ],
    answer: [0, 1],
    explain:
      "A DHCP pool defines the 'network' (subnet/mask) and 'default-router' (gateway), plus optional dns-server, lease, etc.",
  },
  {
    id: "q75",
    domain: 4,
    type: "single",
    q: "Which command verifies active NAT/PAT entries?",
    options: [
      "show ip nat translations",
      "show ip route",
      "show running-config nat",
      "show nat pool",
    ],
    answer: 0,
    explain:
      "'show ip nat translations' lists current inside-local/global mappings; 'show ip nat statistics' shows counters.",
  },

  /* ===================== DOMAIN 5 :: 15 ===================== */
  {
    id: "q76",
    domain: 5,
    type: "single",
    q: "Where should a standard ACL generally be placed?",
    options: [
      "Close to the source",
      "Close to the destination",
      "On the trunk only",
      "On a loopback",
    ],
    answer: 1,
    explain:
      "Standard ACLs match source only, so placing them near the destination avoids accidentally blocking traffic to other networks.",
  },
  {
    id: "q77",
    domain: 5,
    type: "single",
    q: "Which wildcard mask matches exactly the 192.168.4.0/24 network?",
    options: ["0.0.0.0", "0.0.0.255", "0.0.255.255", "255.255.255.0"],
    answer: 1,
    explain:
      "A /24 corresponds to wildcard 0.0.0.255 (0 = must match, 1 = ignore).",
  },
  {
    id: "q78",
    domain: 5,
    type: "single",
    q: "What is appended implicitly to the end of every ACL?",
    options: ["permit ip any any", "deny ip any any", "permit tcp any any", "nothing"],
    answer: 1,
    explain:
      "Every ACL ends with an implicit 'deny any', so anything not explicitly permitted is dropped.",
  },
  {
    id: "q79",
    domain: 5,
    type: "single",
    q: "Which port-security violation mode drops traffic and sends a log/SNMP trap but does NOT disable the port?",
    options: ["protect", "restrict", "shutdown", "secure"],
    answer: 1,
    explain:
      "'restrict' drops offending frames and increments counters/logs; 'protect' is silent; 'shutdown' err-disables the port.",
  },
  {
    id: "q80",
    domain: 5,
    type: "single",
    q: "What does 'switchport port-security mac-address sticky' do?",
    options: [
      "Statically pins one vendor OUI",
      "Dynamically learns MACs and saves them to running-config",
      "Blocks all MAC learning",
      "Enables 802.1X",
    ],
    answer: 1,
    explain:
      "Sticky learning dynamically captures connected MACs and writes them into the running-config so they persist (after saving).",
  },
  {
    id: "q81",
    domain: 5,
    type: "single",
    q: "Which AAA protocol uses TCP port 49 and encrypts the entire payload?",
    options: ["RADIUS", "TACACS+", "Kerberos", "LDAP"],
    answer: 1,
    explain:
      "TACACS+ runs over TCP 49 and encrypts the full packet, and separates authentication, authorization and accounting — ideal for device administration.",
  },
  {
    id: "q82",
    domain: 5,
    type: "single",
    q: "RADIUS uses which transport and encrypts what?",
    options: [
      "TCP 49, entire payload",
      "UDP 1812/1813, password only",
      "UDP 49, all attributes",
      "TCP 1812, entire payload",
    ],
    answer: 1,
    explain:
      "RADIUS uses UDP (1812 auth, 1813 accounting) and encrypts only the password field, combining authn and authz.",
  },
  {
    id: "q83",
    domain: 5,
    type: "single",
    q: "Which Layer-2 mitigation stops a rogue DHCP server from handing out addresses?",
    options: [
      "Dynamic ARP Inspection",
      "DHCP snooping",
      "Port security",
      "BPDU Guard",
    ],
    answer: 1,
    explain:
      "DHCP snooping marks trusted ports (toward the legitimate server) and drops server-sourced messages on untrusted ports.",
  },
  {
    id: "q84",
    domain: 5,
    type: "single",
    q: "Which security feature relies on the DHCP snooping binding table to validate ARP replies?",
    options: [
      "IP Source Guard only",
      "Dynamic ARP Inspection (DAI)",
      "Storm control",
      "Root Guard",
    ],
    answer: 1,
    explain:
      "DAI uses the DHCP snooping binding table to verify ARP messages, dropping spoofed ARP replies.",
  },
  {
    id: "q85",
    domain: 5,
    type: "single",
    q: "Which wireless security uses SAE to replace the pre-shared-key 4-way handshake?",
    options: ["WEP", "WPA", "WPA2-Personal", "WPA3"],
    answer: 3,
    explain:
      "WPA3 introduces Simultaneous Authentication of Equals (SAE), protecting against offline dictionary attacks on the PSK.",
  },
  {
    id: "q86",
    domain: 5,
    type: "single",
    q: "Which prerequisite is required before enabling SSH on a router?",
    options: [
      "Disable AAA",
      "Configure a hostname and a domain name",
      "Set the native VLAN",
      "Enable Telnet first",
    ],
    answer: 1,
    explain:
      "SSH needs a hostname and ip domain-name to label the RSA key pair, plus an RSA key of at least 1024 bits and a login method.",
  },
  {
    id: "q87",
    domain: 5,
    type: "single",
    q: "Which command on the VTY lines disables Telnet and permits only SSH?",
    options: [
      "transport input all",
      "transport input telnet",
      "transport input ssh",
      "no login local",
    ],
    answer: 2,
    explain:
      "'transport input ssh' under the VTY lines restricts remote access to SSH, blocking cleartext Telnet.",
  },
  {
    id: "q88",
    domain: 5,
    type: "multi",
    q: "Which two are correct ACL placement guidelines? (Choose two.)",
    options: [
      "Place extended ACLs close to the source",
      "Place extended ACLs close to the destination",
      "Place standard ACLs close to the destination",
      "Place standard ACLs close to the source",
    ],
    answer: [0, 2],
    explain:
      "Extended ACLs (granular) go near the source to drop traffic early; standard ACLs (source-only) go near the destination.",
  },
  {
    id: "q89",
    domain: 5,
    type: "single",
    q: "Which command best protects the privileged EXEC password?",
    options: [
      "enable password cisco",
      "enable secret cisco",
      "service password-encryption only",
      "username cisco password cisco",
    ],
    answer: 1,
    explain:
      "'enable secret' stores a strong hash (MD5/scrypt), far stronger than 'enable password', which can be weakly encrypted or cleartext.",
  },
  {
    id: "q90",
    domain: 5,
    type: "single",
    q: "VLAN double-tagging (VLAN hopping) is best mitigated by which action?",
    options: [
      "Enable DTP everywhere",
      "Use the data VLAN as the native VLAN",
      "Set the native VLAN to an unused VLAN and disable DTP on access ports",
      "Allow all VLANs on every trunk",
    ],
    answer: 2,
    explain:
      "Assigning an unused, dedicated native VLAN (and never using VLAN 1) plus disabling DTP on access/unused ports defeats double-tagging attacks.",
  },

  /* ===================== DOMAIN 6 :: 10 ===================== */
  {
    id: "q91",
    domain: 6,
    type: "single",
    q: "In SDN, which plane is responsible for actually forwarding packets?",
    options: ["Control plane", "Data (forwarding) plane", "Management plane", "Application plane"],
    answer: 1,
    explain:
      "The data/forwarding plane moves packets based on tables; the control plane builds those tables; the management plane handles admin access.",
  },
  {
    id: "q92",
    domain: 6,
    type: "single",
    q: "Which REST/HTTP verb retrieves data without modifying the resource?",
    options: ["POST", "GET", "PUT", "DELETE"],
    answer: 1,
    explain:
      "GET reads a resource (idempotent, no change). POST creates, PUT updates/replaces, DELETE removes.",
  },
  {
    id: "q93",
    domain: 6,
    type: "single",
    q: "An API call returns HTTP 401. What does this indicate?",
    options: [
      "Success",
      "Resource not found",
      "Unauthorized (authentication failed/expired)",
      "Server error",
    ],
    answer: 2,
    explain:
      "401 Unauthorized means authentication is missing/invalid (e.g. an expired token). 404 = not found, 5xx = server error.",
  },
  {
    id: "q94",
    domain: 6,
    type: "single",
    q: "Which statement about Ansible is correct?",
    options: [
      "It requires an agent on each device",
      "It is agentless and typically uses SSH",
      "It only manages Cisco devices",
      "It uses HCL playbooks",
    ],
    answer: 1,
    explain:
      "Ansible is agentless, connecting over SSH (or network_cli). Playbooks are YAML; HCL is Terraform's language.",
  },
  {
    id: "q95",
    domain: 6,
    type: "single",
    q: "Which tool is a declarative Infrastructure-as-Code language using HCL?",
    options: ["Ansible", "Puppet", "Terraform", "Chef"],
    answer: 2,
    explain:
      "Terraform uses HCL and a declarative model: you define the desired state and it computes the plan to reach it.",
  },
  {
    id: "q96",
    domain: 6,
    type: "single",
    q: "Which protocol is model-driven, runs over SSH port 830, and uses XML payloads?",
    options: ["RESTCONF", "NETCONF", "SNMP", "gRPC"],
    answer: 1,
    explain:
      "NETCONF uses YANG models over SSH (port 830) with XML and transactional edits. RESTCONF is REST-style over HTTPS.",
  },
  {
    id: "q97",
    domain: 6,
    type: "single",
    q: "In the JSON snippet { \"enabled\": true }, what data type is the value?",
    options: ["String", "Boolean", "Number", "Null"],
    answer: 1,
    explain:
      "true/false are JSON booleans (no quotes). Quoted text is a string, bare digits are numbers, and null is its own type.",
  },
  {
    id: "q98",
    domain: 6,
    type: "single",
    q: "Which describes intent-based networking (IBN)?",
    options: [
      "Manual box-by-box CLI configuration",
      "The controller translates business intent into config and continuously assures it",
      "A routing protocol",
      "A type of switch ASIC",
    ],
    answer: 1,
    explain:
      "IBN captures intent (policy/outcome), translates it into device configuration, activates it, and uses telemetry/assurance to keep the network aligned to that intent.",
  },
  {
    id: "q99",
    domain: 6,
    type: "single",
    q: "How does AI/ML add value to network operations (AIOps)?",
    options: [
      "By replacing all routing protocols",
      "By analyzing telemetry for anomaly detection and predictive insight",
      "By encrypting management traffic",
      "By assigning IP addresses",
    ],
    answer: 1,
    explain:
      "AIOps applies machine learning to telemetry to baseline normal behavior, detect anomalies, predict failures/capacity and speed root-cause analysis.",
  },
  {
    id: "q100",
    domain: 6,
    type: "match",
    q: "Match each automation tool/protocol to its key trait.",
    left: ["Ansible", "Terraform", "NETCONF", "REST API"],
    right: [
      "Declarative IaC using HCL",
      "Agentless YAML playbooks over SSH",
      "Stateless HTTPS with JSON, uses verbs like GET/POST",
      "Model-driven, XML over SSH 830",
    ],
    answer: [1, 0, 3, 2],
    explain:
      "Ansible = agentless YAML over SSH; Terraform = declarative HCL IaC; NETCONF = XML over SSH 830; REST API = stateless HTTPS/JSON with HTTP verbs.",
  },
];
