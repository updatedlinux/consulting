<h2>Encuestas Existentes</h2>
            <?php if (!empty($polls)): ?>
                <table class="widefat">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Pregunta</th>
                            <th>Estado</th>
                            <th>Fecha de Inicio</th>
                            <th>Fecha de Fin</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($polls as $poll): ?>
                            <tr>
                                <td><?php echo esc_html($poll['id']); ?></td>
                                <td><?php echo esc_html($poll['question']); ?></td>
                                <td><?php echo esc_html($poll['status']); ?></td>
                                <td><?php echo esc_html($poll['start_date'] ? date('Y-m-d H:i', strtotime($poll['start_date'])) : 'N/A'); ?></td>
                                <td><?php echo esc_html($poll['end_date'] ? date('Y-m-d H:i', strtotime($poll['end_date'])) : 'N/A'); ?></td>
                                <td>
                                    <?php if ($poll['status'] === 'open'): ?>
                                        <form method="post" action="<?php echo admin_url('admin-post.php'); ?>" style="display: inline;">
                                            <input type="hidden" name="action" value="condo360_close_poll">
                                            <input type="hidden" name="poll_id" value="<?php echo esc_attr($poll['id']); ?>">
                                            <?php wp_nonce_field('condo360_close_poll', 'condo360_close_poll_nonce'); ?>
                                            <input type="submit" class="button" value="Cerrar" onclick="return confirm('¿Estás seguro de que quieres cerrar esta encuesta?')">
                                        </form>
                                    <?php else: ?>
                                        Cerrada
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php else: ?>
                <p>No hay encuestas disponibles.</p>
            <?php endif; ?>