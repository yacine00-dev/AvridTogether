# Generated by Django 5.1.1 on 2025-04-30 08:36

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('history', '0005_alter_history_arrival_place_and_more'),
        ('posts', '0009_alter_posts_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='history',
            name='post',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='history', to='posts.posts'),
        ),
    ]
