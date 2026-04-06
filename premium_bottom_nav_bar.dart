import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

class PremiumBottomNavBar extends StatefulWidget {
  const PremiumBottomNavBar({Key? key}) : super(key: key);

  @override
  State<PremiumBottomNavBar> createState() => _PremiumBottomNavBarState();
}

class _PremiumBottomNavBarState extends State<PremiumBottomNavBar> {
  int currentIndex = 0;

  void openQuickActions() {
    // Função para abrir ações rápidas (placeholder)
    print("Ações rápidas abertas");
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 80, // Height: 70–80px
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF0B0F1A), // Background color: #0B0F1A
        borderRadius: BorderRadius.circular(30), // Rounded container (borderRadius: 30)
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.15), // Very subtle shadow only
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          navItem(
            index: 0,
            label: 'Início',
            icon: PhosphorIcons.house,
            activeIcon: PhosphorIcons.houseFill,
          ),
          navItem(
            index: 1,
            label: 'Treinos',
            icon: PhosphorIcons.barbell,
            activeIcon: PhosphorIcons.barbellFill,
          ),
          centerButton(),
          navItem(
            index: 3,
            label: 'Dieta',
            icon: PhosphorIcons.bowlFood,
            activeIcon: PhosphorIcons.bowlFoodFill,
          ),
          navItem(
            index: 4,
            label: 'Profissionais',
            icon: PhosphorIcons.userCircleCheck,
            activeIcon: PhosphorIcons.userCircleCheckFill,
          ),
        ],
      ),
    );
  }

  Widget navItem({
    required int index,
    required String label,
    required IconData icon,
    required IconData activeIcon,
  }) {
    final bool isActive = currentIndex == index;
    final Color color = isActive ? const Color(0xFF2F80ED) : const Color(0xFF6B7280);

    return GestureDetector(
      onTap: () {
        setState(() {
          currentIndex = index;
        });
      },
      behavior: HitTestBehavior.opaque,
      child: Container(
        constraints: const BoxConstraints(minWidth: 48, minHeight: 48), // Ensure proper touch area
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 200), // Smooth transition (200ms)
              transitionBuilder: (Widget child, Animation<double> animation) {
                return ScaleTransition(scale: animation, child: child);
              },
              child: Icon(
                isActive ? activeIcon : icon,
                key: ValueKey<bool>(isActive),
                color: color,
                size: 24, // Size: 24–26
              ),
            ),
            const SizedBox(height: 4), // Small spacing
            Text(
              label,
              style: TextStyle(
                color: color,
                fontSize: 12, // Label (font size ~12)
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
            const SizedBox(height: 4),
            // Indicator animates width when active
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: isActive ? 20 : 0, // width: ~20px
              height: 3, // height: 3px
              decoration: BoxDecoration(
                color: const Color(0xFF2F80ED),
                borderRadius: BorderRadius.circular(1.5), // rounded edges
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget centerButton() {
    return GestureDetector(
      onTap: openQuickActions,
      child: Container(
        width: 60, // Circular (60x60)
        height: 60,
        margin: const EdgeInsets.only(bottom: 8), // Slightly elevated (floating effect)
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF2F80ED),
              Color(0xFF1E5EFF),
            ],
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF2F80ED).withOpacity(0.2), // Subtle shadow (low opacity, not strong glow)
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: const Center(
          child: Icon(
            PhosphorIcons.plus,
            color: Colors.white, // Icon color: white
            size: 26,
          ),
        ),
      ),
    );
  }
}
